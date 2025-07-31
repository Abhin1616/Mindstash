import React, { useEffect, useState, useRef } from 'react';
import MaterialCard from '../components/MaterialCard.jsx';
import MaterialFilters from '../components/MaterialFilters.jsx';
import MaterialPreviewModal from '../components/MaterialPreviewModal.jsx';
import ReportMaterial from './ReportMaterial.jsx';
import ModeratorRemoveModal from '../components/ModeratorRemoveModal.jsx';
import api from '../config/api.js';
import BanUserModal from './BanUserModal.jsx';
import { IoCloseCircleOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

const Dashboard = ({ programs, filters, setFilters, toggleSort, sortByRecent, currentUserId, role }) => {
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [materialList, setMaterialList] = useState([]);
    const [previewMaterial, setPreviewMaterial] = useState(null);
    const [reportingMaterialId, setReportingMaterialId] = useState(null);
    const [modRemoveMaterialId, setModRemoveMaterialId] = useState(null);
    const observerRef = useRef();
    const lastMaterialRef = useRef();
    const seenIdsRef = useRef(new Set());
    const activeQueryRef = useRef('');
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [banUser, setBanUser] = useState(null);

    const handleUpvote = async (materialId) => {
        try {
            const res = await api.post(
                `/materials/${materialId}/upvote`,
                {},
                { withCredentials: true }
            );

            setMaterialList(prev =>
                prev.map(material =>
                    material._id === materialId
                        ? {
                            ...material,
                            upvotes: material.upvotes.includes(currentUserId)
                                ? material.upvotes.filter(id => id !== currentUserId)
                                : [...material.upvotes, currentUserId],
                        }
                        : material
                )
            );
        } catch (err) {
            console.error('Upvote error:', err);
        }
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const handleClearSearch = () => {
        setFilters(prev => ({ ...prev, search: "" }));
    };

    useEffect(() => {
        setPage(1);
        setMaterialList([]);
        setHasMore(true);
        seenIdsRef.current.clear();
        lastMaterialRef.current = null;
    }, [filters, sortByRecent]);

    const onDelete = async (id) => {
        try {
            setDeletingId(id);
            const res = await api.delete(`/materials/${id}`, {
                withCredentials: true,
            });

            if (res.status === 200) {
                setMaterialList(prev => prev.filter(material => material._id !== id));
                seenIdsRef.current.delete(id);
            }
            toast.success("Material deleted sucessfully")
        } catch (error) {
            console.error("Delete error:", error.response?.data || error);
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        let query = `program=${filters.program}&branch=${filters.branch}&semester=${filters.semester}&sort=${sortByRecent ? 'recent' : 'top'}&page=${page}`;
        if (filters.search.trim()) {
            query += `&search=${encodeURIComponent(filters.search.trim())}`;
        }
        activeQueryRef.current = query;

        const fetchMaterials = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/materials?${query}`);
                if (activeQueryRef.current !== query) return;

                const newMaterials = res.data.materials.filter(m => !seenIdsRef.current.has(m._id));
                newMaterials.forEach(m => seenIdsRef.current.add(m._id));

                if (newMaterials.length === 0) {
                    setHasMore(false);
                }

                setMaterialList(prev => [...prev, ...newMaterials]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, [page, filters, sortByRecent]);

    useEffect(() => {
        if (loading || !hasMore || !lastMaterialRef.current) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setTimeout(() => {
                        setPage(prev => prev + 1);
                    }, 250);
                }
            },
            { threshold: 1 }
        );

        observer.observe(lastMaterialRef.current);
        return () => observer.disconnect();
    }, [loading, hasMore, materialList]);

    return (
        <div className="p-4 space-y-6 bg-zinc-50 dark:bg-zinc-900 min-h-screen transition-colors duration-300">
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search materials by title or tags..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="w-full p-2 pl-4 pr-10 rounded-lg border dark:border-white/10 dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {filters.search && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <IoCloseCircleOutline size={24} />
                    </button>
                )}
            </div>

            <MaterialFilters
                filters={filters}
                setFilters={setFilters}
                sortByRecent={sortByRecent}
                toggleSort={toggleSort}
                programs={programs}
            />

            <MaterialPreviewModal
                onReport={() => setReportingMaterialId(previewMaterial?._id)}
                isOpen={!!previewMaterial}
                onClose={() => setPreviewMaterial(null)}
                material={previewMaterial}
                currentUserId={currentUserId}
            />

            <div className="grid grid-cols-1 gap-6">
                {!loading && materialList.length === 0 ? (
                    <div className="text-center py-10 col-span-full bg-white dark:bg-zinc-800 rounded-xl shadow-md">
                        <p className="text-gray-600 dark:text-gray-300">
                            No materials found{filters.search ? ` for "${filters.search}"` : ""}.
                        </p>
                        {filters.search && (
                            <button
                                onClick={() => {
                                    setFilters(prev => ({ ...prev, search: "" }));
                                }}
                                className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-100 rounded-lg"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    materialList.map((material, index) => (
                        <div
                            key={material._id}
                            ref={index === materialList.length - 1 ? lastMaterialRef : null}
                        >
                            <MaterialCard
                                setModRemoveMaterialId={setModRemoveMaterialId}
                                role={role}
                                onReport={() => setReportingMaterialId(material._id)}
                                material={material}
                                currentUserId={currentUserId}
                                onUpvote={handleUpvote}
                                setPreviewMaterial={setPreviewMaterial}
                                confirmingDeleteId={confirmingDeleteId}
                                setConfirmingDeleteId={setConfirmingDeleteId}
                                onDelete={onDelete}
                                setBanUser={setBanUser}
                            />
                        </div>
                    ))
                )}
            </div>

            {loading && <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>}
            {!loading && !hasMore && !filters.search && materialList.length > 0 && (
                <p className="text-center text-gray-400 dark:text-gray-500">No more materials.</p>
            )}

            {reportingMaterialId && (
                <ReportMaterial
                    materialId={reportingMaterialId}
                    onClose={() => setReportingMaterialId(null)}
                />
            )}

            {modRemoveMaterialId && (
                <ModeratorRemoveModal
                    materialId={modRemoveMaterialId}
                    onClose={() => setModRemoveMaterialId(null)}
                    onRemoved={(id) => {
                        setMaterialList(prev => prev.filter(m => m._id.toString() !== id.toString()));
                    }}
                />
            )}
            {banUser && (
                <BanUserModal user={banUser} onClose={() => setBanUser(null)} />
            )}
        </div>
    );
};

export default Dashboard;