export interface Course {
  name: string;
  duration: string;
  durationMonths: number;
  totalFee: number;
  monthlyFee: number;
  category: string;
}

export const COURSES: Course[] = [
  // Computer Applications
  { name: "Office Application", duration: "3 Month", durationMonths: 3, totalFee: 1500, monthlyFee: 400, category: "Computer Applications" },
  { name: "Basics of Computer Application", duration: "6 Month", durationMonths: 6, totalFee: 2500, monthlyFee: 350, category: "Computer Applications" },
  { name: "Diploma in Computer Application", duration: "12 Month", durationMonths: 12, totalFee: 5000, monthlyFee: 350, category: "Computer Applications" },
  { name: "Diploma in Information Technology", duration: "14 Month", durationMonths: 14, totalFee: 5700, monthlyFee: 350, category: "Computer Applications" },
  { name: "Advance Diploma in Computer Application", duration: "18 Month", durationMonths: 18, totalFee: 8200, monthlyFee: 400, category: "Computer Applications" },
  { name: "Post Graduate Diploma in Computer Application", duration: "18 Month", durationMonths: 18, totalFee: 9000, monthlyFee: 500, category: "Computer Applications" },
  
  // Desktop Publishing & Design
  { name: "Certificate in Desktop Publishing", duration: "6 Month", durationMonths: 6, totalFee: 2500, monthlyFee: 350, category: "Design & Publishing" },
  { name: "Diploma in Desktop Publishing", duration: "12 Month", durationMonths: 12, totalFee: 5000, monthlyFee: 350, category: "Design & Publishing" },
  { name: "Certificate in Photoshop & CorelDraw", duration: "3 Month", durationMonths: 3, totalFee: 1500, monthlyFee: 400, category: "Design & Publishing" },
  { name: "Certificate in Web Page Designing", duration: "6 Month", durationMonths: 6, totalFee: 2500, monthlyFee: 350, category: "Design & Publishing" },
  { name: "Diploma in Web Page Designing", duration: "12 Month", durationMonths: 12, totalFee: 5000, monthlyFee: 350, category: "Design & Publishing" },
  
  // Accounting & Tally
  { name: "Certificate in Financial Accounting", duration: "6 Month", durationMonths: 6, totalFee: 2500, monthlyFee: 350, category: "Accounting" },
  { name: "Diploma in Financial Accounting", duration: "12 Month", durationMonths: 12, totalFee: 5000, monthlyFee: 350, category: "Accounting" },
  { name: "Certificate in Tally ERP9", duration: "3 Month", durationMonths: 3, totalFee: 1500, monthlyFee: 400, category: "Accounting" },
  
  // Office Management
  { name: "Diploma in Office Application & Management", duration: "12 Month", durationMonths: 12, totalFee: 5000, monthlyFee: 350, category: "Office Management" },
  { name: "Diploma in Office Management", duration: "12 Month", durationMonths: 12, totalFee: 5000, monthlyFee: 350, category: "Office Management" },
  { name: "Advance Diploma in Computer Technology", duration: "12 Month", durationMonths: 12, totalFee: 5000, monthlyFee: 350, category: "Office Management" },
  
  // Language & Communication
  { name: "Typing Certificate", duration: "3 Month", durationMonths: 3, totalFee: 2000, monthlyFee: 500, category: "Language & Skills" },
  { name: "Basic Spoken English", duration: "3 Month", durationMonths: 3, totalFee: 2000, monthlyFee: 500, category: "Language & Skills" },
  { name: "Certificate in Spoken English", duration: "6 Month", durationMonths: 6, totalFee: 3000, monthlyFee: 350, category: "Language & Skills" },
  
  // Professional
  { name: "Diploma in Computer Teachers Training", duration: "18 Month", durationMonths: 18, totalFee: 8200, monthlyFee: 400, category: "Professional" },
];

export const COURSE_CATEGORIES = [
  "Computer Applications",
  "Design & Publishing", 
  "Accounting",
  "Office Management",
  "Language & Skills",
  "Professional"
];

export const getCourseByName = (name: string): Course | undefined => {
  return COURSES.find(course => course.name === name);
};
