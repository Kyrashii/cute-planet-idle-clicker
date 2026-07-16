import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal stack behavior", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div><div id="modal-root"></div>';
  });

  it("closes only the topmost modal on Escape", () => {
    const closeBottom = vi.fn();
    const closeTop = vi.fn();

    render(
      <>
        <Modal isOpen onClose={closeBottom} ariaLabel="Bottom dialog">
          <button>Bottom action</button>
        </Modal>
        <Modal isOpen onClose={closeTop} ariaLabel="Top dialog">
          <button>Top action</button>
        </Modal>
      </>,
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(closeTop).toHaveBeenCalledTimes(1);
    expect(closeBottom).not.toHaveBeenCalled();
  });

  it("closes only the topmost modal from its semantic backdrop", () => {
    const closeBottom = vi.fn();
    const closeTop = vi.fn();

    render(
      <>
        <Modal isOpen onClose={closeBottom} ariaLabel="Bottom dialog">
          <button>Bottom action</button>
        </Modal>
        <Modal isOpen onClose={closeTop} ariaLabel="Top dialog">
          <button>Top action</button>
        </Modal>
      </>,
    );

    const backdrops = screen.getAllByRole("button", { name: "Dialog schließen" });
    fireEvent.click(backdrops[0]);
    fireEvent.click(backdrops[1]);

    expect(closeBottom).not.toHaveBeenCalled();
    expect(closeTop).toHaveBeenCalledTimes(1);
  });

  it("provides an accessible dialog name and focus fallback", () => {
    render(
      <Modal isOpen onClose={vi.fn()} ariaLabel="Named dialog">
        <div>No focusable children</div>
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Named dialog" })).toBeInTheDocument();
  });
});
