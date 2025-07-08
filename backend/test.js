export const candidateInfo = {
    id: '12347182734', // user id from users table id
    userId: '12347182734', // user id from users table 
    profileUrl: "/url", //profile url after uploaded 
    resumeUrl: '/resume url', //resume url after uploaded
    skills: ['skill 1 ', 'skill 2'], // skills array 
    experience_years: 4,
    certifications: ['certification 1', 'certification 2'],// TODO uplod cietefication 
    job_preferences: ["job preference 1", "job preference 2"],
    job_role_preferences: 'role preference',
    languages_spoken: ['language 1', 'language 2'],
    video_portfolio_url: 'url',
    expected_salary: 'number',
    profile_status: 'complete  | incomplete | Hidden',
    awards_and_honors: [''],
    candidate_visibility: 'Hidden | private | public ',
    preferred_job_location: ['location 1', 'location 2'],
    relocation_preference: true | false,
    premium_service_active: true | false,  //default false
    education: [
        {
            name: 'ssc',
            university: '',
            institute: 'institute',
            startYear: '2010',
            passingYear: '2010',
            status: 'pass | failed',
            cgpa: '',
            percentage: '90',

        }
    ],   // it will store multiple objects that will contain all the precious education history 
    experience: [
        {
            company: 'company name',
            position: 'position',
            startDate: '2010',
            endDate: '2015',
            jobDescription: 'description',
            employmentType: 'employment type', // fulltime | partTime | contract
            currentlyWorking: true | false, // currently working or not 
            jobLocation: 'location',


        }
    ],
}
export const userActivity = {
    userId: 'userId',
    remarks: 'remarks', // activity like profile update or resomeupdate or any other id updated 
    timestamp: 'timestamp', // timestamp of the activity
    mutateTable: 'mutateTable',
    content_url: '',
    file_size: '',
    file_format: '',
    status: true | false, //content approved or not will be defined by admin 
}



