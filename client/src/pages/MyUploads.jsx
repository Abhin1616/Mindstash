import React, { useEffect, useState, useRef } from 'react';
import api from '../config/api.js';
import { Link } from 'react-router-dom';
import MaterialCard from '../components/MaterialCard.jsx';
import MaterialPreviewModal from '../components/MaterialPreviewModal.jsx';
import { Plus } from 'lucide-react';

const MyUploads = ({ currentUserId }) => {
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [materialList, setMaterialList] = useState([]);
    const [previewMaterial, setPreviewMaterial] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [materialCount, setMaterialCount] = useState()
    const lastMaterialRef = useRef(null);
    const seenIdsRef = useRef(new Set());
    const activeQueryRef = useRef('');

    const fetchUploads = async () => {
        setLoading(true);
        const query = `page=${page}`;
        activeQueryRef.current = query;

        try {
            const res = await api.get(
                `http://localhost:3000/materials/myuploads?page=${page}&limit=10`,
                { withCredentials: true }
            );

            // cancel if query changed mid-request
            if (activeQueryRef.current !== query) return;

            const newMaterials = res.data.materials.filter(m => !seenIdsRef.current.has(m._id));
            newMaterials.forEach(m => seenIdsRef.current.add(m._id));

            setMaterialList(prev => [...prev, ...newMaterials]);

            if (newMaterials.length < 10) {
                setHasMore(false);
            }
            setMaterialCount(res.data.materialCount)
        } catch (err) {
            console.error('Fetch error:', err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUserId) fetchUploads();
    }, [page, currentUserId]);

    useEffect(() => {
        if (loading || !hasMore || !lastMaterialRef.current) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setTimeout(() => setPage(prev => prev + 1), 250);
                }
            },
            { threshold: 1 }
        );

        observer.observe(lastMaterialRef.current);

        return () => observer.disconnect();
    }, [loading, hasMore, materialList]);

    const handleUpvote = async (materialId) => {
        try {
            await api.post(
                `http://localhost:3000/materials/${materialId}/upvote`,
                {},
                { withCredentials: true }
            );

            setMaterialList((prev) =>
                prev.map((material) =>
                    material._id === materialId
                        ? {
                            ...material,
                            upvotes: material.upvotes.includes(currentUserId)
                                ? material.upvotes.filter((id) => id !== currentUserId)
                                : [...material.upvotes, currentUserId],
                        }
                        : material
                )
            );
        } catch (err) {
            console.error('Upvote error:', err);
        }
    };

    const onDelete = async (id) => {
        try {
            setDeletingId(id);
            const res = await api.delete(`http://localhost:3000/materials/${id}`, {
                withCredentials: true,
            });

            if (res.status === 200) {
                setMaterialList((prev) => prev.filter((m) => m._id !== id));
                seenIdsRef.current.delete(id);
                console.log('Deleted:', id);
                setMaterialCount(materialCount - 1)
            }
        } catch (error) {
            console.error('Delete error:', error.response?.data || error);
        } finally {
            setDeletingId(null);
        }
    };

    // Reset when user changes
    useEffect(() => {
        setPage(1);
        setMaterialList([]);
        setHasMore(true);
        seenIdsRef.current.clear();
        lastMaterialRef.current = null;
    }, [currentUserId]);
    return (
        <div className="p-4 space-y-6">
            {/* Use the same grid for heading/button and cards */}
            <div className="grid grid-cols-1 gap-6">
                {/* Heading + button wrapped in the same padding as cards */}
                <div className="p-2 sm:p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Your Uploaded Materials{materialCount > 0 && ` (${materialCount})`}
                            </h2>
                        </div>
                        <Link
                            to="/upload-material"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition active:scale-95"
                        >
                            <Plus size={16} /> Upload a Material
                        </Link>
                    </div>
                </div>

                {/* Material cards below in same grid */}
                {materialList.map((material, index) => (
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
                {currentUserId && <MaterialPreviewModal
                    isOpen={!!previewMaterial}
                    onClose={() => setPreviewMaterial(null)}
                    material={previewMaterial}
                    onUpvote={handleUpvote}
                    currentUserId={currentUserId}
                />}
            </div>

            {/* Status section stays outside the grid */}
            {loading && page === 1 && (
                <p className="text-center text-gray-500">Loading your uploads...</p>
            )}
            {!loading && materialList.length === 0 && (
                <p className="text-center text-gray-400">You haven’t uploaded anything yet.</p>
            )}
            {loading && page > 1 && (
                <p className="text-center text-gray-500">Loading more...</p>
            )}
            {!hasMore && !loading && materialList.length > 0 && (
                <p className="text-center text-gray-400">All uploads loaded ✅</p>
            )}
        </div>
    );
};

export default MyUploads;