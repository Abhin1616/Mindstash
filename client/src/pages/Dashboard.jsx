import React, { useEffect, useState, useRef } from 'react';
import MaterialCard from '../components/MaterialCard.jsx';
import MaterialFilters from '../components/MaterialFilters.jsx';
import axios from 'axios';
import MaterialPreviewModal from '../components/MaterialPreviewModal.jsx';

const Dashboard = ({ programs, filters, setFilters, toggleSort, sortByRecent, currentUserId }) => {
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [materialList, setMaterialList] = useState([]);
    const [previewMaterial, setPreviewMaterial] = useState(null);

    const observerRef = useRef();
    const lastMaterialRef = useRef();

    const seenIdsRef = useRef(new Set());
    const activeQueryRef = useRef('');
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const handleUpvote = async (materialId) => {
        try {
            const res = await axios.post(
                `http://localhost:3000/materials/${materialId}/upvote`,
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
            setDeletingId(id); // 👈 lock that card
            const res = await axios.delete(`http://localhost:3000/materials/${id}`, {
                withCredentials: true,
            });

            if (res.status === 200) {
                setMaterialList(prev => prev.filter(material => material._id !== id));
                seenIdsRef.current.delete(id);
                console.log("Deleted:", id);
            }
        } catch (error) {
            console.error("Delete error:", error.response?.data || error);
        } finally {
            setDeletingId(null); // 👈 unlock once done
        }
    };

    // Fetch paginated materials
    useEffect(() => {
        const query = `program=${filters.program}&branch=${filters.branch}&semester=${filters.semester}&sort=${sortByRecent ? 'recent' : 'top'}&page=${page}`;
        activeQueryRef.current = query;
        const fetchMaterials = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:3000/materials?${query}`);

                // cancel if query changed mid-request
                if (activeQueryRef.current !== query) return;

                const newMaterials = res.data.materials.filter(m => !seenIdsRef.current.has(m._id));
                newMaterials.forEach(m => seenIdsRef.current.add(m._id));

                setMaterialList(prev => [...prev, ...newMaterials]);

                if (res.data.materials.length === 0 || newMaterials.length === 0) {
                    setHasMore(false);
                }
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
                isOpen={!!previewMaterial}
                onClose={() => setPreviewMaterial(null)}
                material={previewMaterial}
                onUpvote={handleUpvote}
            />
            <div className="grid grid-cols-1 gap-6">
                {currentUserId !== undefined &&
                    materialList.map((material, index) => (
                        <div
                            key={material._id}
                            ref={index === materialList.length - 1 ? lastMaterialRef : null}
                        >
                            <MaterialCard
                                material={material}
                                currentUserId={currentUserId}
                                onUpvote={handleUpvote}
                                setPreviewMaterial={setPreviewMaterial}
                                confirmingDeleteId={confirmingDeleteId}
                                setConfirmingDeleteId={setConfirmingDeleteId}
                                onDelete={onDelete}
                                isDeleting={deletingId === material._id}
                            />
                        </div>
                    ))}
            </div>

            {loading && <p className="text-center text-gray-500">Loading...</p>}
            {!hasMore && !loading && (
                <p className="text-center text-gray-400">No more materials.</p>
            )}
        </div>
    );
};

export default Dashboard;