import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Signup from "./Signup";
import { ToastProvider } from "../context/ToastContext";

describe("Signup", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("submits a member account and switches to login with the email", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ user_id: 1, email: "member@example.com", role: "member" }),
    });
    const onShowLogin = vi.fn();

    render(<ToastProvider><Signup isOpen onClose={vi.fn()} onShowLogin={onShowLogin} /></ToastProvider>);
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Lovelace" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "member@example.com" } });
      fireEvent.change(screen.getByRole("textbox", { name: "Phone number" }), { target: { value: "712345678" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "strongpass" } });
    fireEvent.submit(screen.getByRole("button", { name: "Create Account" }).closest("form"));

    await waitFor(() => expect(onShowLogin).toHaveBeenCalledWith("member@example.com"));
    expect(JSON.parse(globalThis.fetch.mock.calls[0][1].body)).toMatchObject({ role: "member", first_name: "Ada" });
    expect(JSON.parse(globalThis.fetch.mock.calls[0][1].body)).toMatchObject({ role: "member", first_name: "Ada", phone: "+254 712345678" });
  });

  it("renders a server validation error", async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 422, json: async () => ({ password: ["Longer password required"] }) });

    render(<ToastProvider><Signup isOpen onClose={vi.fn()} onShowLogin={vi.fn()} /></ToastProvider>);
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Lovelace" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "bad@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });
    fireEvent.submit(screen.getByRole("button", { name: "Create Account" }).closest("form"));

    expect(await screen.findByRole("alert")).toHaveTextContent("Longer password required");
  });
});
