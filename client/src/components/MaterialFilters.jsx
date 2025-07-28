import React, { useState, useRef, useEffect } from 'react';

const MaterialFilters = ({ filters, setFilters, sortByRecent, toggleSort, programs }) => {
    const PROGRAMS = programs.map((p) => p.name);
    const BRANCHES = programs.reduce((acc, program) => {
        acc[program.name] = program.branches.map((b) => b.name);
        return acc;
    }, {});

    const SEMESTERS = (() => {
        const selectedProgram = programs.find(p => p.name === filters.program);
        const selectedBranch = selectedProgram?.branches.find(b => b.name === filters.branch);
        const count = selectedBranch?.semesters || 0;
        return Array.from({ length: count }, (_, i) => (i + 1).toString());
    })();

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const filterRef = useRef(null);
    const buttonRef = useRef(null);

    const handleChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            ...(field === 'program' && { branch: 'all', semester: 'all' }),
            ...(field === 'branch' && { semester: 'all' }),
        }));
        setOpenDropdown(null);

        if (field === 'semester') {
            setShowMobileFilters(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                filterRef.current &&
                !filterRef.current.contains(e.target) &&
                !buttonRef.current.contains(e.target)
            ) {
                setOpenDropdown(null);
                setShowMobileFilters(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        document.body.style.overflow = showMobileFilters ? 'hidden' : '';
    }, [showMobileFilters]);

    const CustomDropdown = ({ label, field, options, disabled = false }) => (
        <div className="relative w-full mdmat:w-48">
            <label className="text-sm text-gray-600 dark:text-gray-300">{label}</label>
            <button
                disabled={disabled}
                className={`w-full p-2 mt-1 text-left bg-white dark:bg-[#1f2937] border dark:border-gray-600 rounded shadow-sm flex justify-between items-center transition hover:bg-gray-50 dark:hover:bg-[#2a3342] active:bg-gray-100 dark:active:bg-[#374151] ${disabled ? 'opacity-50' : ''
                    }`}
                onClick={() => setOpenDropdown(openDropdown === field ? null : field)}
            >
                <span className="text-gray-800 dark:text-gray-100">{filters[field] === 'all' ? `All ${label}` : filters[field]}</span>
                <svg className="w-4 h-4 ml-2 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {openDropdown === field && (
                <div className="absolute z-30 mt-1 w-full max-h-40 overflow-y-auto bg-white dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                    <div
                        className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-100 dark:hover:bg-[#334155] ${filters[field] === 'all' ? 'bg-blue-100 dark:bg-[#334155] text-blue-700 dark:text-blue-400 font-semibold' : 'dark:text-gray-200'
                            }`}
                        onClick={() => handleChange(field, 'all')}
                    >
                        All {label}
                    </div>
                    {options.map((val, i) => (
                        <div
                            key={i}
                            className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-100 dark:hover:bg-[#334155] ${filters[field] === val ? 'bg-blue-100 dark:bg-[#334155] text-blue-700 dark:text-blue-400 font-semibold' : 'dark:text-gray-200'
                                }`}
                            onClick={() => handleChange(field, val)}
                        >
                            {val}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full relative">
            {/* Mobile Filters */}
            <div className="mdmat:hidden flex justify-between items-center mb-2 relative z-30">
                <button
                    ref={buttonRef}
                    className={`text-sm font-medium border px-3 py-1 rounded flex items-center gap-1 transition ${showMobileFilters
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'text-blue-600 bg-white dark:bg-[#1f2937] dark:text-blue-400 border-blue-600 hover:bg-blue-50 dark:hover:bg-[#2a3342]'
                        }`}
                    onClick={() => setShowMobileFilters(prev => !prev)}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 14.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-6.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    Filters
                </button>

                <div className={`flex items-center gap-1 transition-all duration-200 ${showMobileFilters ? 'blur-[2px] pointer-events-none' : ''}`}>
                    <button
                        onClick={() => !sortByRecent && toggleSort()}
                        className={`px-2.5 py-1 text-xs rounded font-medium border ${sortByRecent
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-[#1f2937] text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600'
                            }`}
                    >
                        Recent
                    </button>
                    <button
                        onClick={() => sortByRecent && toggleSort()}
                        className={`px-2.5 py-1 text-xs rounded font-medium border ${!sortByRecent
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-[#1f2937] text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600'
                            }`}
                    >
                        Top
                    </button>
                </div>
            </div>

            {showMobileFilters && <div className="fixed inset-0 z-10 backdrop-blur-[2px] bg-black/10 dark:bg-black/20 transition-opacity duration-150" />}

            {showMobileFilters && (
                <div
                    ref={filterRef}
                    className="absolute left-0 right-0 mt-2 z-20 bg-white dark:bg-[#111827] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3 mx-2 animate-slide-down origin-top ml-0"
                >
                    <CustomDropdown label="Programs" field="program" options={PROGRAMS} />
                    <CustomDropdown label="Branches" field="branch" options={BRANCHES[filters.program] || []} disabled={filters.program === 'all'} />
                    <CustomDropdown label="Semesters" field="semester" options={SEMESTERS} disabled={filters.branch === 'all'} />
                </div>
            )}

            {/* Desktop Filters */}
            <div className="hidden mdmat:block px-4 mdmat:px-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex gap-4 flex-wrap items-end">
                        <div className="w-[200px]">
                            <CustomDropdown label="Programs" field="program" options={PROGRAMS} />
                        </div>
                        <div className="w-[200px]">
                            <CustomDropdown label="Branches" field="branch" options={BRANCHES[filters.program] || []} disabled={filters.program === 'all'} />
                        </div>
                        <div className="w-[180px]">
                            <CustomDropdown label="Semesters" field="semester" options={SEMESTERS} disabled={filters.branch === 'all'} />
                        </div>
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={() => !sortByRecent && toggleSort()}
                            className={`px-4 py-2 text-sm rounded font-medium border ${sortByRecent
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-[#1f2937] text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            Recent
                        </button>
                        <button
                            onClick={() => sortByRecent && toggleSort()}
                            className={`px-4 py-2 text-sm rounded font-medium border ${!sortByRecent
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-[#1f2937] text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            Top
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialFilters;
