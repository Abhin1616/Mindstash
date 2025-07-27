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

    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await api.get("/auth/verify", {
                    withCredentials: true,
                });
                // setCurrentUserId(res.data.user.id); // remove if unused
            } catch (err) {
                console.error("Failed to get user:", err);
            }
        };
        getUser();
    }, []);

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
                <h1 className="text-xl font-semibold text-gray-800">Moderation Reports</h1>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {loading ? (
                <p className="text-center text-sm text-gray-500">Loading...</p>
            ) : reports.length === 0 ? (
                <p className="text-center text-sm text-gray-500">No reports found.</p>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div key={report._id} className="border rounded-md p-4 shadow-sm bg-white">
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${report.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : report.status === "accepted"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}>
                                    {report.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</span>
                            </div>

                            <div className="text-sm text-gray-700 mb-2">
                                <p><strong>Material:</strong> {report.materialTitle}</p>
                                <p><strong>Reported By:</strong> {report.reportedBy.name}</p>
                                <p><strong>Uploaded By:</strong> {report.snapshot.uploadedBy.name}</p>
                                <p><strong>Program:</strong> {report.snapshot.program}, <strong>Branch:</strong> {report.snapshot.branch}, <strong>Semester:</strong> {report.snapshot.semester}</p>
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
                                    className="text-blue-600 text-sm underline hover:text-blue-800 mb-2"
                                >
                                    Preview Material
                                </button>
                            )}

                            {report.status === "pending" && (
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full border rounded p-2 text-sm"
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
                                            className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                            onClick={() => handleReport(report._id, "accept")}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            disabled={handlingId === report._id}
                                            className="px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-semibold truncate">{previewMaterial.title}</h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-gray-500 hover:text-red-600 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{previewMaterial.description}</p>
                            <div className="bg-gray-100 rounded-md p-2 flex justify-center">
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
