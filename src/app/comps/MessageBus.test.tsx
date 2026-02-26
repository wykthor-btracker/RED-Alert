import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useContext, useRef, useEffect } from "react";
import { MessageBus } from "./MessageBus";
import { MessageBusContext } from "../contexts/MessageBusContext";
import SideMenu from "./sideMenu";
import { ConfigProvider } from "antd";

const CONNECTION_TIMEOUT_MS = 15000;

function createMockDataConnection(open = false) {
  const handlers: Record<string, (...args: unknown[]) => void> = {};
  return {
    open,
    metadata: { label: "TestPeer", avatar: "" },
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn((event: string, fn: (...args: unknown[]) => void) => {
      handlers[event] = fn;
      return createMockDataConnection();
    }),
    emit: (event: string, ...args: unknown[]) => {
      handlers[event]?.(...args);
    },
  };
}

const messageMock = vi.hoisted(() => ({
  loading: vi.fn(),
  destroy: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  open: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
}));

const peerHandlers = vi.hoisted(() => ({} as Record<string, (...args: unknown[]) => void>));
const mockConnectReturnRef = vi.hoisted(() => ({ current: createMockDataConnection() }));

const MockPeer = vi.hoisted(() =>
  vi.fn().mockImplementation(() => ({
    on: vi.fn((event: string, fn: (...args: unknown[]) => void) => {
      peerHandlers[event] = fn;
      return {};
    }),
    connect: vi.fn(() => {
      mockConnectReturnRef.current = createMockDataConnection(false);
      return mockConnectReturnRef.current;
    }),
    destroy: vi.fn(),
  }))
);

vi.mock("antd", async (orig) => {
  const actual = await orig() as object;
  return {
    ...actual,
    message: {
      ...(actual as any).message,
      useMessage: () => [messageMock, null],
    },
  };
});

vi.mock("peerjs", () => ({
  default: MockPeer,
}));

function ContextSpy({ onContext }: { onContext: (ctx: React.ContextType<typeof MessageBusContext>) => void }) {
  const ctx = useContext(MessageBusContext);
  const ref = useRef(ctx);
  ref.current = ctx;
  useEffect(() => {
    onContext(ref.current);
  });
  return <span data-testid="spy">spy</span>;
}

function renderWithSpy() {
  let context: React.ContextType<typeof MessageBusContext> | null = null;
  render(
    <ConfigProvider>
      <MessageBus>
        <ContextSpy onContext={(c) => { context = c; }} />
      </MessageBus>
    </ConfigProvider>
  );
  return () => context!;
}

describe("MessageBus P2P", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    Object.keys(peerHandlers).forEach((k) => delete peerHandlers[k]);
    mockConnectReturnRef.current = createMockDataConnection();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cleans up peer on unmount (destroy called)", () => {
    const { unmount, getContext } = (() => {
      let ctx: React.ContextType<typeof MessageBusContext> | null = null;
      const result = render(
        <ConfigProvider>
          <MessageBus>
            <ContextSpy onContext={(c) => { ctx = c; }} />
          </MessageBus>
        </ConfigProvider>
      );
      return {
        ...result,
        getContext: () => ctx!,
      };
    })();
    act(() => {
      getContext().host();
    });
    act(() => {
      peerHandlers.open?.();
    });
    const instance = MockPeer.mock.results[MockPeer.mock.results.length - 1].value;
    unmount();
    expect(instance.destroy).toHaveBeenCalled();
  });

  it("node connection timeout shows error when data connection never opens", () => {
    const getContext = renderWithSpy();
    act(() => {
      getContext().node("fake-id");
    });
    act(() => {
      peerHandlers.open?.();
    });
    expect(mockConnectReturnRef.current).toBeDefined();
    act(() => {
      vi.advanceTimersByTime(CONNECTION_TIMEOUT_MS + 1000);
    });
    expect(messageMock.error).toHaveBeenCalled();
  });

  it("peer error clears connected state", () => {
    const getContext = renderWithSpy();
    act(() => {
      getContext().host();
    });
    act(() => {
      peerHandlers.open?.();
    });
    expect(getContext().connected).toBe(true);
    act(() => {
      peerHandlers.error?.({ message: "Network error" });
    });
    expect(getContext().connected).toBe(false);
  });

  it("host removes peer from connections when connection closes", () => {
    const getContext = renderWithSpy();
    act(() => {
      getContext().host();
    });
    act(() => {
      peerHandlers.open?.();
    });
    const conn = createMockDataConnection(true);
    act(() => {
      peerHandlers.connection?.(conn);
    });
    expect(getContext().connections).toHaveLength(1);
    act(() => {
      conn.emit("close");
    });
    expect(getContext().connections).toHaveLength(0);
  });

  it("Desconectar button calls disconnect and clears connected state", () => {
    let ctx: React.ContextType<typeof MessageBusContext> | null = null;
    render(
      <ConfigProvider>
        <MessageBus>
          <ContextSpy onContext={(c) => { ctx = c; }} />
          <SideMenu />
        </MessageBus>
      </ConfigProvider>
    );
    const getContext = () => ctx!;
    act(() => {
      getContext().node("test-id");
    });
    act(() => {
      peerHandlers.open?.();
    });
    act(() => {
      mockConnectReturnRef.current.emit("open");
    });
    expect(getContext().connected).toBe(true);
    const desconectar = Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Desconectar")
    );
    expect(desconectar).toBeTruthy();
    act(() => {
      desconectar!.click();
    });
    expect(getContext().connected).toBe(false);
  });
});
