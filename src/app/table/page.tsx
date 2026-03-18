"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useThemeColor } from "@/hooks/useThemeColor";

type UserEntry = {
  id: string;
  value: number;
  date: string;
  notes?: string;
};

export default function TablePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const secondary = useThemeColor("Main", "Secondary");
  const secondaryHover = useThemeColor("Hover", "Secondary");
  const onSecondary = useThemeColor("On", "Secondary");
  const destructiveText = useThemeColor("Text", "Destructive");
  const destructiveHover = useThemeColor("Text Hover", "Destructive");
  const primaryBorder = useThemeColor("Border", "Primary");

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/entries");

      if (response.status === 401) {
        // Unauthorized - redirect to login
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load data");
      }

      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      loadEntries();
    }
  }, [status, router, loadEntries]);

  // Delete a single entry
  const deleteEntry = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/entries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      // Refresh the entries list
      await loadEntries();
      setSelectedEntryId(null);
    } catch (error) {
      console.error("Error deleting entry:", error);
      setError("Failed to delete entry. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete all entries
  const deleteAllEntries = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch("/api/entries/delete-all", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entries");
      }

      // Refresh the entries list
      await loadEntries();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting all entries:", error);
      setError("Failed to delete entries. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Display loading state while checking authentication
  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div
          className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${primaryBorder}`}
        ></div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!session) {
    return null;
  }

  if (error) {
    return (
      <Alert variant="error">
        <p>{error}</p>
        <Button
          onClick={() => loadEntries()}
          className="mt-2"
          variant="primary"
          size="sm"
        >
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Table</h1>

        <div className="flex gap-2">
          <a href="/api/entries/export" download>
            <Button variant="outline" disabled={loading}>
              Export CSV
            </Button>
          </a>
          {entries.length > 0 && (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="danger"
              disabled={isDeleting}
              isLoading={isDeleting}
            >
              Delete All
            </Button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <Alert variant="info" icon={true}>
          No entries found. Create some entries on the homepage.
        </Alert>
      ) : (
        <div className="overflow-x-auto">
          <table className={`w-full text-left border-collapse ${onSecondary}`}>
            <thead>
              <tr className={`${secondary}`}>
                <th className="p-3">Date</th>
                <th className="p-3">Value</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`${secondaryHover} ${onSecondary}`}
                >
                  <td className="p-3">{formatDate(entry.date)}</td>
                  <td className="p-3 font-medium">{entry.value}</td>
                  <td className="p-3">{entry.notes || "-"}</td>
                  <td className="p-3 text-center">
                    <Button
                      onClick={() => setSelectedEntryId(entry.id)}
                      variant="ghost"
                      size="icon"
                      className={`${destructiveText} ${destructiveHover}`}
                      disabled={isDeleting}
                      title="Delete entry"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Single Entry Delete Confirmation Modal */}
      {selectedEntryId && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p>
              Are you sure you want to delete this entry? This action cannot be
              undone.
            </p>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                onClick={() => setSelectedEntryId(null)}
                variant="outline"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteEntry(selectedEntryId)}
                variant="danger"
                isLoading={isDeleting}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Delete All Entries</h3>
            <p>
              Are you sure you want to delete all entries? This action cannot be
              undone.
            </p>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={deleteAllEntries}
                variant="danger"
                isLoading={isDeleting}
                disabled={isDeleting}
              >
                Delete All
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
