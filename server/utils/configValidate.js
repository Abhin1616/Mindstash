import PROGRAMS from "../config/programs.js";

export const isValidProgram = (program) =>
    PROGRAMS.some(p => p.name === program);

export const isValidBranch = (program, branch) => {
    const prog = PROGRAMS.find(p => p.name === program);
    return prog?.branches.some(b => b.name === branch);
};

export const isValidSemester = (program, branch, semester) => {
    const prog = PROGRAMS.find(p => p.name === program);
    const branchData = prog?.branches.find(b => b.name === branch);
    return branchData && semester >= 1 && semester <= branchData.semesters;
};
