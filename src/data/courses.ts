export interface Course {
  name: string;
  duration: string;
  totalFee: number;
  category: string;
}

export const COURSES: Course[] = [
  // Computer Applications
  { name: "Office Application", duration: "3 Month", totalFee: 1500, category: "Computer Applications" },
  { name: "Basics of Computer Application", duration: "6 Month", totalFee: 2500, category: "Computer Applications" },
  { name: "Diploma in Computer Application", duration: "12 Month", totalFee: 5000, category: "Computer Applications" },
  { name: "Diploma in Information Technology", duration: "14 Month", totalFee: 5700, category: "Computer Applications" },
  { name: "Advance Diploma in Computer Application", duration: "18 Month", totalFee: 8200, category: "Computer Applications" },
  { name: "Post Graduate Diploma in Computer Application", duration: "18 Month", totalFee: 9000, category: "Computer Applications" },
  
  // Desktop Publishing & Design
  { name: "Certificate in Desktop Publishing", duration: "6 Month", totalFee: 2500, category: "Design & Publishing" },
  { name: "Diploma in Desktop Publishing", duration: "12 Month", totalFee: 5000, category: "Design & Publishing" },
  { name: "Certificate in Photoshop & CorelDraw", duration: "3 Month", totalFee: 1500, category: "Design & Publishing" },
  { name: "Certificate in Web Page Designing", duration: "6 Month", totalFee: 2500, category: "Design & Publishing" },
  { name: "Diploma in Web Page Designing", duration: "12 Month", totalFee: 5000, category: "Design & Publishing" },
  
  // Accounting & Tally
  { name: "Certificate in Financial Accounting", duration: "6 Month", totalFee: 2500, category: "Accounting" },
  { name: "Diploma in Financial Accounting", duration: "12 Month", totalFee: 5000, category: "Accounting" },
  { name: "Certificate in Tally ERP9", duration: "3 Month", totalFee: 1500, category: "Accounting" },
  
  // Office Management
  { name: "Diploma in Office Application & Management", duration: "12 Month", totalFee: 5000, category: "Office Management" },
  { name: "Diploma in Office Management", duration: "12 Month", totalFee: 5000, category: "Office Management" },
  { name: "Advance Diploma in Computer Technology", duration: "12 Month", totalFee: 5000, category: "Office Management" },
  
  // Language & Communication
  { name: "Typing Certificate", duration: "3 Month", totalFee: 2000, category: "Language & Skills" },
  { name: "Basic Spoken English", duration: "3 Month", totalFee: 2000, category: "Language & Skills" },
  { name: "Certificate in Spoken English", duration: "6 Month", totalFee: 3000, category: "Language & Skills" },
  
  // Professional
  { name: "Diploma in Computer Teachers Training", duration: "18 Month", totalFee: 8200, category: "Professional" },
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
