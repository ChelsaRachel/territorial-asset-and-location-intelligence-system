import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/apiClient";
import { AddPolicyNoteModal } from "./AddPolicyNoteModal";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("AddPolicyNoteModal", () => {
  it("saves a valid policy and returns the pending-compute item", async () => {
    const onSaved = vi.fn();
    const onClose = vi.fn();
    render(
      <AddPolicyNoteModal
        wilayahId={1206090}
        snapshotStartDate="2024-01-01"
        onClose={onClose}
        onSaved={onSaved}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Judul/i), { target: { value: "Pembangunan Cold Storage Kabanjahe" } });
    fireEvent.change(screen.getByLabelText(/Deskripsi/i), { target: { value: "Program APBD untuk memperkuat rantai dingin hortikultura Berastagi." } });
    fireEvent.click(screen.getByRole("button", { name: "demand" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const savedItem = onSaved.mock.calls[0]?.[0];
    expect(savedItem).toMatchObject({
      wilayah_id: 1206090,
      title: "Pembangunan Cold Storage Kabanjahe",
      attribution_status: "pending_compute_in_12_months",
    });
    expect(await apiClient.monitoring.getPolicyLog(1206090)).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "Pembangunan Cold Storage Kabanjahe" })]),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
