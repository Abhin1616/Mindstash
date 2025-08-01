import React, { useEffect, useState } from "react";
import api from '../config/api.js';
import toast from "react-hot-toast";

const ModerationReports = () => {
    const [reports, setReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [loading, setLoading] = useState(false);
    const [handlingId, setHandlingId] = useState(null);
    const [comments, setComments] = useState({});
    const [previewMaterial, setPreviewMaterial] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);


    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/reports/moderation?status=${statusFilter}`, {
                withCredentials: true,
            });
            setReports(data);
        } catch (err) {
            console.error("Error fetching reports:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    const handleReport = async (id, action) => {
        const comment = comments[id] || "";
        setHandlingId(id);
        try {
            await api.patch(
                `/reports/${id}/handle`,
                { action, comment },
                { withCredentials: true }
            );
            setComments((prev) => ({ ...prev, [id]: "" }));
            fetchReports();
            toast.success("Report Handled");
        } catch (err) {
            console.error("Failed to handle report:", err);
        } finally {
            setHandlingId(null);
        }
    };

    const handlePreview = async (materialId) => {
        try {
            const { data } = await api.get(`/materials/${materialId}`, {
                withCredentials: true,
            });
            setPreviewMaterial(data);
            setModalOpen(true);
        } catch (err) {
            toast.error("Failed to fetch material.");
        }
    };

    return (
        <div className="p-4 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Moderation Reports</h1>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-700 dark:text-white"
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {loading ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Loading...</p>
            ) : reports.length === 0 ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">No reports found.</p>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div key={report._id} className="border rounded-md p-4 shadow-sm bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
                            <div className="flex justify-between items-center mb-2">
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-semibold ${report.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900"
                                        : report.status === "accepted"
                                            ? "bg-green-100 text-green-700 dark:bg-green-200 dark:text-green-900"
                                            : "bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-900"
                                        }`}
                                >
                                    {report.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(report.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <div className="text-sm text-gray-700 dark:text-gray-200 mb-2 space-y-1">
                                <p><strong>Material:</strong> {report.materialTitle}</p>
                                <p>
                                    <strong>Reported By:</strong> {report.reportedBy?.name}
                                    <span className="text-gray-500 text-xs dark:text-gray-400"> ({report.reportedBy?.email})</span>
                                </p>
                                <p>
                                    <strong>Uploaded By:</strong> {report.uploadedBy?.name || report.snapshot.uploadedBy?.name}
                                    <span className="text-gray-500 text-xs dark:text-gray-400"> ({report.uploadedBy?.email || "email unavailable"})</span>
                                </p>
                                <p><strong>Program:</strong> {report.snapshot.program}, <strong>Branch:</strong> {report.snapshot.branch}, <strong>Semester:</strong> {report.snapshot.semester}</p>
                                <p><strong>Reason:</strong> {report.reason}</p>
                                {report.brokenRules?.length > 0 && (
                                    <p><strong>Broken Rules:</strong> {report.brokenRules.join(', ')}</p>
                                )}
                                {report.reviewedBy && (
                                    <p><strong>Reviewed By:</strong> {report.reviewedBy.name}</p>
                                )}
                                {report.moderatorComment && (
                                    <p><strong>Comment:</strong> {report.moderatorComment}</p>
                                )}
                            </div>

                            {report.materialId && (
                                <button
                                    onClick={() => handlePreview(report.materialId)}
                                    className="text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800 dark:hover:text-blue-300 mb-2"
                                >
                                    Preview Material
                                </button>
                            )}

                            {report.status === "pending" && (
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full border rounded p-2 text-sm bg-white dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                                        placeholder="Add moderator comment... (optional)"
                                        value={comments[report._id] || ""}
                                        onChange={(e) =>
                                            setComments((prev) => ({
                                                ...prev,
                                                [report._id]: e.target.value,
                                            }))
                                        }
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            disabled={handlingId === report._id}
                                            className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-70"
                                            onClick={() => handleReport(report._id, "accept")}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            disabled={handlingId === report._id}
                                            className="px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-70"
                                            onClick={() => handleReport(report._id, "reject")}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && previewMaterial && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-700">
                            <h2 className="text-lg font-semibold truncate dark:text-white">{previewMaterial.title}</h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{previewMaterial.description}</p>
                            <div className="bg-gray-100 dark:bg-zinc-700 rounded-md p-2 flex justify-center">
                                {previewMaterial.fileType === "pdf" ? (
                                    <iframe
                                        src={previewMaterial.fileUrl}
                                        title="Preview"
                                        className="w-full h-[400px] rounded"
                                    />
                                ) : (
                                    <img
                                        src={previewMaterial.fileUrl}
                                        alt="Preview"
                                        className="max-h-[400px] w-auto mx-auto rounded"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default ModerationReports;
