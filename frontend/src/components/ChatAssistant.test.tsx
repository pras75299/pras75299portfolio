import axios from "axios";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ChatAssistant from "./ChatAssistant";
import { apiClient } from "../utils/api";

describe("ChatAssistant", () => {
  it("sends a trimmed message and renders the assistant response", async () => {
    const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
      data: {
        response: "Projects are available in the portfolio.",
        timestamp: "2026-04-25T10:00:00.000Z",
      },
    });

    render(<ChatAssistant isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText("Ask about experience...");

    fireEvent.change(input, {
      target: { value: "  Tell me about projects  " },
    });
    fireEvent.keyPress(input, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        apiClient.chat,
        { message: "Tell me about projects" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    expect(await screen.findByText("Tell me about projects")).toBeInTheDocument();
    expect(
      await screen.findByText("Projects are available in the portfolio.")
    ).toBeInTheDocument();
  });

  it("renders the server error message when the request fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    vi.spyOn(axios, "post").mockRejectedValue({
      isAxiosError: true,
      response: {
        data: {
          error: "Chat is temporarily unavailable.",
        },
      },
    });

    render(<ChatAssistant isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText("Ask about experience...");

    fireEvent.change(input, {
      target: { value: "Status?" },
    });
    fireEvent.keyPress(input, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    expect(await screen.findByText("Status?")).toBeInTheDocument();
    expect(
      await screen.findByText("Chat is temporarily unavailable.")
    ).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
