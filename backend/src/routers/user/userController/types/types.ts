// types.ts

export interface Education {
    name: string;
    university: string;
    institute: string;
    startYear: string;
    passingYear: string;
    status: string;
    cgpa?: string;
    percentage: string;
}

export interface Experience {
    company: string;
    position: string;
    startYear: string;
    endYear: string;
    jobDescription: string;
    employmentType: string;
    currentlyWorking: boolean;
    jobLocation: string;
}

export interface CandidateInfo {
    id: string;
    userId: string;
    profileUrl: string;
    resumeUrl: string;
    Dob: string;
    education: Education[];
    experience: Experience[];
}

export interface CandidateBody {
    profilePicture: string;
    resume: string;
    Dob: string;
    education: Education[];
    experience: Experience[];
}
