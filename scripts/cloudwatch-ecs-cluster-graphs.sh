#!/usr/bin/env bash
# Generate CloudWatch-style CPU, Memory, and Ephemeral Storage utilization
# graphs for ECS clusters with Container Insights (and instance-level metrics) enabled.
#
# Uses ECS/ContainerInsights namespace and instance_* metrics (percent). These
# metrics require "Deploying the CloudWatch agent to collect EC2 instance-level
# metrics on Amazon ECS" — see AWS docs. Fargate-only clusters do not emit
# instance_* metrics; only EC2-backed clusters with the agent do.
#
# Prereqs: AWS CLI configured, jq, Python 3 with matplotlib
# Usage: ./cloudwatch-ecs-cluster-graphs.sh [cluster1 cluster2 ...]
#        CLUSTERS and START/END can be set via env (see below).

set -euo pipefail

# --- Config (override via env) ---
CLUSTERS="${CLUSTERS:-qa-shared dev-shared jetta-prod tpi-secure-prod}"
END_TIME="${END_TIME:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
START_TIME="${START_TIME:-$(date -u -v-30d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%SZ)}"
PERIOD="${PERIOD:-3600}"
OUT_DIR="${OUT_DIR:-./cloudwatch-graphs}"
REGION="${AWS_REGION:-us-east-1}"
NAMESPACE="ECS/ContainerInsights"

# ECS Container Insights instance-level metrics (ClusterName dimension, Unit: Percent)
METRICS="instance_cpu_utilization instance_memory_utilization instance_filesystem_utilization"

# Allow passing clusters as script arguments
if [[ $# -gt 0 ]]; then
  CLUSTERS="$*"
fi

mkdir -p "$OUT_DIR"
DATA_DIR="$OUT_DIR/data"
mkdir -p "$DATA_DIR"

# --- Build MetricDataQueries for get-metric-data (one query per cluster per metric) ---
build_queries() {
  local idx=0
  for cluster in $CLUSTERS; do
    for metric in $METRICS; do
      local id="m${idx}_${cluster//-/_}_${metric}"
      echo "{\"Id\":\"${id}\",\"MetricStat\":{\"Metric\":{\"Namespace\":\"${NAMESPACE}\",\"MetricName\":\"${metric}\",\"Dimensions\":[{\"Name\":\"ClusterName\",\"Value\":\"${cluster}\"}]},\"Period\":${PERIOD},\"Stat\":\"Average\"},\"Label\":\"${cluster}\"}"
      (( idx++ )) || true
    done
  done
}

# Build full get-metric-data request so the CLI receives exact structure (avoids list param wrapping)
REQUEST_FILE="$DATA_DIR/get_metric_data_request.json"
QUERIES_JSON=$(build_queries | jq -R -s -c 'split("\n") | map(select(length>0)) | map(fromjson)')
jq -n \
  --arg start "$START_TIME" \
  --arg end "$END_TIME" \
  --argjson queries "$QUERIES_JSON" \
  '{StartTime: $start, EndTime: $end, MetricDataQueries: $queries}' > "$REQUEST_FILE"

echo "Fetching ECS Container Insights metrics from $START_TIME to $END_TIME for clusters: $CLUSTERS"
aws cloudwatch get-metric-data \
  --region "$REGION" \
  --cli-input-json "file://$REQUEST_FILE" \
  --output json > "$DATA_DIR/raw_metrics.json"

# --- Parse JSON into CSV (timestamp, cluster, metric, value) for plotting ---
# Id format: m{N}_{cluster}_{metric} -> extract cluster from Label, metric from Id
parse_csv() {
  jq -r '
    .MetricDataResults[] |
    .Label as $cluster |
    (.Id | split("_")[2:] | join("_")) as $metric |
    (.Timestamps | to_entries[]) as $ts |
    [$ts.value, $cluster, $metric, .Values[$ts.key]] | @csv
  ' "$DATA_DIR/raw_metrics.json" | sort -t',' -k1,1 -k2,2 -k3,3
}

parse_csv > "$DATA_DIR/all_metrics.csv"

# --- Plot with Python (dark theme, one chart per metric) ---
export DATA_DIR OUT_DIR
python3 << 'PYTHON_SCRIPT'
import csv
import os
from collections import defaultdict
from datetime import datetime

try:
  import matplotlib
  matplotlib.use('Agg')
  import matplotlib.pyplot as plt
  import matplotlib.dates as mdates
except ImportError:
  print("Install matplotlib: pip install matplotlib")
  exit(1)

DATA_DIR = os.environ.get('DATA_DIR', './cloudwatch-graphs/data')
OUT_DIR = os.environ.get('OUT_DIR', './cloudwatch-graphs')

# Read CSV: timestamp, cluster, metric, value
ts_cluster_metric_value = defaultdict(lambda: defaultdict(dict))
with open(f'{DATA_DIR}/all_metrics.csv') as f:
  for row in csv.reader(f):
    if len(row) < 4:
      continue
    ts_str, cluster, metric, value = row[0], row[1], row[2], row[3]
    try:
      ts = datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
      val = float(value)
    except (ValueError, TypeError):
      continue
    ts_cluster_metric_value[metric][cluster][ts] = val

# ECS Container Insights instance-level metric names -> chart titles
titles = {
  'instance_cpu_utilization': 'CPU utilization',
  'instance_memory_utilization': 'Memory utilization',
  'instance_filesystem_utilization': 'Ephemeral Storage Utilization',
}

plt.style.use('dark_background')
colors = ['#7eb8da', '#f0a050', '#6cb86c', '#e07070', '#a070c0']

for metric, title in titles.items():
  if metric not in ts_cluster_metric_value:
    continue
  fig, ax = plt.subplots(figsize=(10, 5))
  clusters = sorted(ts_cluster_metric_value[metric].keys())
  for i, cluster in enumerate(clusters):
    data = ts_cluster_metric_value[metric][cluster]
    if not data:
      continue
    times = sorted(data.keys())
    values = [data[t] for t in times]
    avg = sum(values) / len(values) if values else 0
    color = colors[i % len(colors)]
    ax.plot(times, values, label=f'[avg: {avg:.3f}] {cluster}', color=color)
  ax.set_ylabel('Percent')
  ax.set_title(title)
  ax.legend(loc='upper center', bbox_to_anchor=(0.5, -0.12), ncol=min(len(clusters), 4))
  ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%d'))
  ax.xaxis.set_major_locator(mdates.WeekdayLocator())
  fig.tight_layout()
  safe_name = metric.replace('_', '-')
  fig.savefig(f'{OUT_DIR}/{safe_name}.png', dpi=120, bbox_inches='tight')
  plt.close()
  print(f'Saved {OUT_DIR}/{safe_name}.png')
PYTHON_SCRIPT

echo "Done. Graphs written to $OUT_DIR/"
