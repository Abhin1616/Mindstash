import React, { useEffect, useState, useRef } from 'react';
import MaterialCard from '../components/MaterialCard.jsx';
import MaterialFilters from '../components/MaterialFilters.jsx';
import MaterialPreviewModal from '../components/MaterialPreviewModal.jsx';
import ReportMaterial from './ReportMaterial.jsx';
import ModeratorRemoveModal from '../components/ModeratorRemoveModal.jsx';
import api from '../config/api.js';

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

    // Reset materials when filters or sort change
    useEffect(() => {
        setPage(1);
        setMaterialList([]);
        setHasMore(true);
        seenIdsRef.current.clear();

        // 👇 Reset lastMaterialRef manually
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
        } catch (error) {
            console.error("Delete error:", error.response?.data || error);
        } finally {
            setDeletingId(null);
        }
    };

    // Fetch paginated materials
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

    // Debounced infinite scroll observer
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
    }, [loading, hasMore, materialList]); // 👈 react to list changes

    return (
        <div className="p-4 space-y-6">
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
                {materialList.length === 0 ? (
                    <div className="text-center py-10 col-span-full">
                        <p className="text-gray-600">
                            No materials found{filters.search ? ` for "${filters.search}"` : ""}.
                        </p>
                        {filters.search && (
                            <button
                                onClick={() => {
                                    setFilters(prev => ({ ...prev, search: "" }));
                                }}
                                className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
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
                            />
                        </div>
                    ))
                )}
            </div>


            {loading && <p className="text-center text-gray-500">Loading...</p>}
            {!hasMore && !loading && (
                <p className="text-center text-gray-400">No more materials.</p>
            )}
            {/*Report Modal*/}
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
                        setModRemoveMaterialId(null);
                        onDelete(id);
                    }}
                />
            )}

        </div>
    );
};

export default Dashboard;