import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { Institution } from '../src/models/Institution.js';
import { Complaint } from '../src/models/Complaint.js';
import { CaseHistory } from '../src/models/CaseHistory.js';
import { Overlap } from '../src/models/Overlap.js';
import { Notification } from '../src/models/Notification.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { Counter } from '../src/models/Counter.js';
import { ROLES, BUREAUS, REGIONS, COMPLAINT_CATEGORIES, COMPLAINT_STATUSES, COMPLAINT_PRIORITIES, ACTION_TYPES } from '../src/config/roles.js';
import { detectOverlapsForInstitution } from '../src/services/overlapEngine.js';
import { logger } from '../src/utils/logger.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aicte_complaints';

export async function seedDatabase() {
  try {
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB Atlas for Tamil Nadu dataset seeding.');

    // Clear existing collections for a clean idempotent reset
    await Promise.all([
      User.deleteMany({}),
      Institution.deleteMany({}),
      Complaint.deleteMany({}),
      CaseHistory.deleteMany({}),
      Overlap.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Counter.deleteMany({})
    ]);

    logger.info('Cleaned old records from MongoDB cluster.');

    // 1. Seed AICTE Officers & Demo Users
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Password@123', salt);

    const usersData = [
      {
        name: 'Dr. Ramesh Sharma (Super Admin)',
        email: 'admin@aicte.gov.in',
        passwordHash: demoPasswordHash,
        role: ROLES.SUPER_ADMIN,
        bureau: 'All',
        region: 'All',
        isActive: true
      },
      {
        name: 'Prof. T. G. Sitharam (Senior Advisor)',
        email: 'advisor@aicte.gov.in',
        passwordHash: demoPasswordHash,
        role: ROLES.SENIOR_MANAGEMENT,
        bureau: 'All',
        region: 'All',
        isActive: true
      },
      {
        name: 'Dr. Sunita Rao (PGRC Bureau Head)',
        email: 'officer.pgrc@aicte.gov.in',
        passwordHash: demoPasswordHash,
        role: ROLES.BUREAU_OFFICER,
        bureau: 'Public Grievance Redressal Cell (PGRC)',
        region: 'Southern',
        isActive: true
      },
      {
        name: 'Shri Manoj Kumar (RB Bureau Head)',
        email: 'officer.rb@aicte.gov.in',
        passwordHash: demoPasswordHash,
        role: ROLES.BUREAU_OFFICER,
        bureau: 'Regulation Bureau (RB)',
        region: 'Southern',
        isActive: true
      },
      {
        name: 'Dr. K. Ravichandran (Southern Regional Officer)',
        email: 'officer.south@aicte.gov.in',
        passwordHash: demoPasswordHash,
        role: ROLES.REGIONAL_OFFICER,
        bureau: 'Regional Office',
        region: 'Southern',
        isActive: true
      },
      {
        name: 'CA Meenakshi Sundaram (Independent Auditor)',
        email: 'auditor@aicte.gov.in',
        passwordHash: demoPasswordHash,
        role: ROLES.AUDITOR,
        bureau: 'All',
        region: 'Southern',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(usersData);
    logger.info(`Seeded ${createdUsers.length} official user accounts.`);

    const adminUser = createdUsers[0];
    const pgrcOfficer = createdUsers[2];
    const rbOfficer = createdUsers[3];
    const regionalOfficer = createdUsers[4];

    // 2. Seed 25 Verified Tamil Nadu AICTE Institutions (Southern Region)
    const institutionsData = [
      {
        aictePermanentId: '1-109012341',
        name: 'College of Engineering, Guindy (Anna University)',
        institutionType: 'Engineering & Technology',
        address: 'Sardar Patel Road, Guindy',
        state: 'Tamil Nadu',
        district: 'Chennai',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-22358491',
          email: 'dean@ceg.annauniv.edu',
          principalName: 'Dr. K. S. Balamurugan',
          website: 'https://ceg.annauniv.edu'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012342',
        name: 'Madras Institute of Technology (MIT Chromepet, Anna University)',
        institutionType: 'Engineering & Technology',
        address: 'MIT Road, Chromepet',
        state: 'Tamil Nadu',
        district: 'Chengalpattu',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-22232403',
          email: 'dean@mitindia.edu',
          principalName: 'Dr. J. Prakash',
          website: 'https://mitindia.edu'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012343',
        name: 'PSG College of Technology',
        institutionType: 'Engineering & Technology',
        address: 'Post Box No. 1611, Avinashi Road, Peelamedu',
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        region: 'Southern',
        contactDetails: {
          phone: '+91-422-4344777',
          email: 'principal@psgtech.edu',
          principalName: 'Dr. K. Prakasan',
          website: 'https://psgtech.edu'
        },
        institutionStatus: 'Under Scrutiny'
      },
      {
        aictePermanentId: '1-109012344',
        name: 'Thiagarajar College of Engineering (TCE)',
        institutionType: 'Engineering & Technology',
        address: 'GST Road, Thiruparankundram',
        state: 'Tamil Nadu',
        district: 'Madurai',
        region: 'Southern',
        contactDetails: {
          phone: '+91-452-2482240',
          email: 'principal@tce.edu',
          principalName: 'Dr. M. Palaninatha Raja',
          website: 'https://tce.edu'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012345',
        name: 'Coimbatore Institute of Technology (CIT)',
        institutionType: 'Engineering & Technology',
        address: 'Civil Aerodrome Post, Peelamedu',
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        region: 'Southern',
        contactDetails: {
          phone: '+91-422-2574071',
          email: 'principal@cit.edu.in',
          principalName: 'Dr. A. Rajeswari',
          website: 'https://cit.edu.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012346',
        name: 'SSN College of Engineering (Sri Sivasubramaniya Nadar)',
        institutionType: 'Engineering & Technology',
        address: 'Rajiv Gandhi Salai (OMR), Kalavakkam',
        state: 'Tamil Nadu',
        district: 'Chengalpattu',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-27469700',
          email: 'principal@ssn.edu.in',
          principalName: 'Dr. V. E. Annamalai',
          website: 'https://ssn.edu.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012347',
        name: 'Government College of Technology (GCT)',
        institutionType: 'Engineering & Technology',
        address: 'Thadagam Road, Post Office Post',
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        region: 'Southern',
        contactDetails: {
          phone: '+91-422-2432221',
          email: 'principal@gct.ac.in',
          principalName: 'Dr. K. Manonmani',
          website: 'https://gct.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012348',
        name: 'Government College of Engineering, Salem',
        institutionType: 'Engineering & Technology',
        address: 'Bangalore National Highway NH-7',
        state: 'Tamil Nadu',
        district: 'Salem',
        region: 'Southern',
        contactDetails: {
          phone: '+91-427-2346157',
          email: 'principal@gcesalem.edu.in',
          principalName: 'Dr. R. Vijayan',
          website: 'https://gcesalem.edu.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012349',
        name: 'Government College of Engineering, Tirunelveli',
        institutionType: 'Engineering & Technology',
        address: 'Trivandrum Road, Palayamkottai',
        state: 'Tamil Nadu',
        district: 'Tirunelveli',
        region: 'Southern',
        contactDetails: {
          phone: '+91-462-2552450',
          email: 'principal@gcetly.ac.in',
          principalName: 'Dr. P. Latha',
          website: 'https://gcetly.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012350',
        name: 'Kumaraguru College of Technology (KCT)',
        institutionType: 'Engineering & Technology',
        address: 'Chinnavedampatti, Saravanampatti',
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        region: 'Southern',
        contactDetails: {
          phone: '+91-422-2669401',
          email: 'principal@kct.ac.in',
          principalName: 'Dr. D. Saravanan',
          website: 'https://kct.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012351',
        name: 'Kongu Engineering College',
        institutionType: 'Engineering & Technology',
        address: 'Perundurai Railway Station Road, Thoppupalayam',
        state: 'Tamil Nadu',
        district: 'Erode',
        region: 'Southern',
        contactDetails: {
          phone: '+91-4294-226555',
          email: 'principal@kongu.ac.in',
          principalName: 'Dr. V. Balusamy',
          website: 'https://kongu.ac.in'
        },
        institutionStatus: 'Under Scrutiny'
      },
      {
        aictePermanentId: '1-109012352',
        name: 'Sri Krishna College of Engineering and Technology (SKCET)',
        institutionType: 'Engineering & Technology',
        address: 'Sugunapuram, Kuniamuthur',
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        region: 'Southern',
        contactDetails: {
          phone: '+91-422-2678001',
          email: 'info@skcet.ac.in',
          principalName: 'Dr. J. Janet',
          website: 'https://skcet.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012353',
        name: 'Rajalakshmi Engineering College (REC)',
        institutionType: 'Engineering & Technology',
        address: 'Rajalakshmi Nagar, Thandalam',
        state: 'Tamil Nadu',
        district: 'Kancheepuram',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-67181111',
          email: 'principal@rajalakshmi.edu.in',
          principalName: 'Dr. S. N. Murugesan',
          website: 'https://rajalakshmi.org'
        },
        institutionStatus: 'Show Cause Issued'
      },
      {
        aictePermanentId: '1-109012354',
        name: 'St. Joseph\'s College of Engineering',
        institutionType: 'Engineering & Technology',
        address: 'Jeppiaar Nagar, Old Mahabalipuram Road',
        state: 'Tamil Nadu',
        district: 'Chennai',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-24501060',
          email: 'principal@stjosephs.ac.in',
          principalName: 'Dr. Vaddi Seshagiri Rao',
          website: 'https://stjosephs.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012355',
        name: 'Sri Venkateswara College of Engineering (SVCE)',
        institutionType: 'Engineering & Technology',
        address: 'Post Bag No. 1, Pennalur, Sriperumbudur',
        state: 'Tamil Nadu',
        district: 'Kancheepuram',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-27152000',
          email: 'principal@svce.ac.in',
          principalName: 'Dr. S. Ganesh Vaidyanathan',
          website: 'https://svce.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012356',
        name: 'Chennai Institute of Technology (CIT Chennai)',
        institutionType: 'Engineering & Technology',
        address: 'SH-113, Sarathy Nagar, Kundrathur',
        state: 'Tamil Nadu',
        district: 'Chennai',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-71119111',
          email: 'principal@citchennai.net',
          principalName: 'Dr. A. Ramesh',
          website: 'https://citchennai.edu.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012357',
        name: 'Mepco Schlenk Engineering College',
        institutionType: 'Engineering & Technology',
        address: 'Mepco Nagar, Amathur Post',
        state: 'Tamil Nadu',
        district: 'Virudhunagar',
        region: 'Southern',
        contactDetails: {
          phone: '+91-4562-235104',
          email: 'principal@mepcoeng.ac.in',
          principalName: 'Dr. S. Arivazhagan',
          website: 'https://mepcoeng.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012358',
        name: 'Bannari Amman Institute of Technology (BIT)',
        institutionType: 'Engineering & Technology',
        address: 'Alathukombai Post, Sathyamangalam',
        state: 'Tamil Nadu',
        district: 'Erode',
        region: 'Southern',
        contactDetails: {
          phone: '+91-4295-226000',
          email: 'principal@bitsathy.ac.in',
          principalName: 'Dr. C. Palanisamy',
          website: 'https://bitsathy.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012359',
        name: 'Sona College of Technology',
        institutionType: 'Engineering & Technology',
        address: 'Sona Nagar, Junction Road, Suramangalam',
        state: 'Tamil Nadu',
        district: 'Salem',
        region: 'Southern',
        contactDetails: {
          phone: '+91-427-4099999',
          email: 'info@sonatech.ac.in',
          principalName: 'Dr. S. R. R. Senthil Kumar',
          website: 'https://sonatech.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012360',
        name: 'Alagappa Chettiar Government College of Engineering & Technology (ACGCET)',
        institutionType: 'Engineering & Technology',
        address: 'College Road, Karaikudi',
        state: 'Tamil Nadu',
        district: 'Sivaganga',
        region: 'Southern',
        contactDetails: {
          phone: '+91-4565-224528',
          email: 'principal@accet.edu.in',
          principalName: 'Dr. P. K. Palani',
          website: 'https://accetedu.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012361',
        name: 'National Engineering College',
        institutionType: 'Engineering & Technology',
        address: 'K.R. Nagar, Nalattinputhur, Kovilpatti',
        state: 'Tamil Nadu',
        district: 'Thoothukudi',
        region: 'Southern',
        contactDetails: {
          phone: '+91-4632-222502',
          email: 'principal@nec.edu.in',
          principalName: 'Dr. K. Kalidasa Murugavel',
          website: 'https://nec.edu.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012362',
        name: 'SRM Valliammai Engineering College',
        institutionType: 'Engineering & Technology',
        address: 'SRM Nagar, Kattankulathur',
        state: 'Tamil Nadu',
        district: 'Chengalpattu',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-27454784',
          email: 'srmvec@valliammai.co.in',
          principalName: 'Dr. M. Murugan',
          website: 'https://srmvalliammai.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012363',
        name: 'R.M.K. Engineering College',
        institutionType: 'Engineering & Technology',
        address: 'RSM Nagar, Kavaraipettai, Gummidipoondi',
        state: 'Tamil Nadu',
        district: 'Tiruvallur',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-67906790',
          email: 'principal@rmkec.ac.in',
          principalName: 'Dr. K. A. Mohamed Junaid',
          website: 'https://rmkec.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012364',
        name: 'Easwari Engineering College',
        institutionType: 'Engineering & Technology',
        address: 'Bharathi Salai, Ramapuram',
        state: 'Tamil Nadu',
        district: 'Chennai',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-43923041',
          email: 'principal@eec.srmrmp.edu.in',
          principalName: 'Dr. K. Kathiravan',
          website: 'https://srmeaswari.ac.in'
        },
        institutionStatus: 'Approved'
      },
      {
        aictePermanentId: '1-109012365',
        name: 'Central Polytechnic College, Chennai',
        institutionType: 'Polytechnic',
        address: 'CIT Campus, Taramani',
        state: 'Tamil Nadu',
        district: 'Chennai',
        region: 'Southern',
        contactDetails: {
          phone: '+91-44-22541334',
          email: 'cptchennai@gmail.com',
          principalName: 'Dr. K. Sundaramoorthy',
          website: 'https://cptchennai.ac.in'
        },
        institutionStatus: 'Approved'
      }
    ];

    const createdInstitutions = await Institution.insertMany(institutionsData);
    logger.info(`Seeded ${createdInstitutions.length} Tamil Nadu technical institutions.`);

    // Map by Permanent ID for quick reference
    const instMap = {};
    createdInstitutions.forEach(inst => {
      instMap[inst.aictePermanentId] = inst;
    });

    const psgTech = instMap['1-109012343'];
    const recInst = instMap['1-109012353'];
    const cegInst = instMap['1-109012341'];
    const konguInst = instMap['1-109012351'];
    const citInst = instMap['1-109012345'];
    const tceInst = instMap['1-109012344']; // Thiagarajar College of Engineering, Madurai

    // 3. Realistic Complaints grounded in Tamil Nadu Engineering & Tech Context
    const complaintsToCreate = [
      // === DEMONSTRATION SCENARIO 1: PSG College of Technology (High Overlap: PGRC + RB) ===
      {
        caseId: 'AICTE-2026-00001',
        institutionId: psgTech._id,
        institutionName: psgTech.name,
        aictePermanentId: psgTech.aictePermanentId,
        category: 'Infrastructure',
        subject: 'Deficient computer laboratories and structural ventilation hazards in mechanical testing lab',
        description: 'Students and research scholars submitted formal grievances regarding non-functional high-performance computing systems and non-operational fume extraction units in the material testing laboratory.',
        priority: 'High',
        status: 'Under Process',
        assignedBureau: 'Public Grievance Redressal Cell (PGRC)',
        assignedOfficer: pgrcOfficer._id,
        assignedOfficerName: pgrcOfficer.name,
        receivedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        nextAction: 'Joint technical committee inspection at Coimbatore campus'
      },
      {
        caseId: 'AICTE-2026-00002',
        institutionId: psgTech._id,
        institutionName: psgTech.name,
        aictePermanentId: psgTech.aictePermanentId,
        category: 'Regulatory Compliance',
        subject: 'Regulatory non-compliance regarding laboratory carpet area and building fire safety clearance',
        description: 'AICTE Southern Regional Office audit revealed failure to update structural fitness and fire safety renewals for the multi-storey laboratory complex in accordance with the Approval Process Handbook.',
        priority: 'High',
        status: 'Pending',
        assignedBureau: 'Regulation Bureau (RB)',
        assignedOfficer: rbOfficer._id,
        assignedOfficerName: rbOfficer.name,
        receivedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        nextAction: 'Issuance of formal show-cause query to Governing Council'
      },
      {
        caseId: 'AICTE-2026-00003',
        institutionId: psgTech._id,
        institutionName: psgTech.name,
        aictePermanentId: psgTech.aictePermanentId,
        category: 'Examination-Related Issues',
        subject: 'Delay in publication of autonomous revaluation results for end-semester examinations',
        description: 'Undergraduate candidates filed grievance regarding 45-day delay in autonomous revaluation scorecards needed for higher studies admissions abroad.',
        priority: 'Low',
        status: 'Disposed',
        assignedBureau: 'Public Grievance Redressal Cell (PGRC)',
        assignedOfficer: pgrcOfficer._id,
        assignedOfficerName: pgrcOfficer.name,
        receivedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        disposedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
        nextAction: 'Case Closed upon controller of examinations compliance affidavit'
      },

      // === DEMONSTRATION SCENARIO 2: Rajalakshmi Engineering College (Critical Overdue Overlap) ===
      {
        caseId: 'AICTE-2026-00004',
        institutionId: recInst._id,
        institutionName: recInst.name,
        aictePermanentId: recInst.aictePermanentId,
        category: 'Admission and Fee Issues',
        subject: 'Levy of unauthorized capitation fees and mandatory transportation surcharge',
        description: 'Parent association lodged complaint stating the institution collected excess infrastructure and transportation fees exceeding Tamil Nadu State Fee Fixation Committee ceilings.',
        priority: 'Critical',
        status: 'Escalated',
        assignedBureau: 'Regulation Bureau (RB)',
        assignedOfficer: rbOfficer._id,
        assignedOfficerName: rbOfficer.name,
        receivedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // Overdue!
        nextAction: 'AICTE Southern Regional Hearing at Chennai'
      },
      {
        caseId: 'AICTE-2026-00005',
        institutionId: recInst._id,
        institutionName: recInst.name,
        aictePermanentId: recInst.aictePermanentId,
        category: 'Student Grievances',
        subject: 'Harassment and withholding of hall tickets demanding unapproved transportation fee clearance',
        description: 'Third-year engineering students reported denial of semester examination hall tickets over contested bus transportation fee dues.',
        priority: 'High',
        status: 'Under Process',
        assignedBureau: 'Public Grievance Redressal Cell (PGRC)',
        assignedOfficer: pgrcOfficer._id,
        assignedOfficerName: pgrcOfficer.name,
        receivedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        nextAction: 'Direct deposition before AICTE Grievance Ombudsman'
      },

      // === DEMONSTRATION SCENARIO 3: College of Engineering Guindy (Faculty Cadre Ratio) ===
      {
        caseId: 'AICTE-2026-00006',
        institutionId: cegInst._id,
        institutionName: cegInst.name,
        aictePermanentId: cegInst.aictePermanentId,
        category: 'Faculty and Staffing',
        subject: 'Deficit in mandatory cadre ratio (1:2:6) and ad-hoc guest faculty appointment tenures',
        description: 'Staff association petition regarding long-term vacancies in Professor and Associate Professor cadres, breaching mandatory AICTE faculty cadre ratio.',
        priority: 'Medium',
        status: 'Under Process',
        assignedBureau: 'Regulation Bureau (RB)',
        assignedOfficer: rbOfficer._id,
        assignedOfficerName: rbOfficer.name,
        receivedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        nextAction: 'University Registrar consultation meeting'
      },
      {
        caseId: 'AICTE-2026-00007',
        institutionId: cegInst._id,
        institutionName: cegInst.name,
        aictePermanentId: cegInst.aictePermanentId,
        category: 'Student Grievances',
        subject: 'Shortage of dedicated course instructors and thesis supervisors in specialized PG courses',
        description: 'M.E. students submitted grievance that faculty shortage has disrupted core elective offerings and laboratory viva examinations.',
        priority: 'Medium',
        status: 'Pending',
        assignedBureau: 'Public Grievance Redressal Cell (PGRC)',
        assignedOfficer: pgrcOfficer._id,
        assignedOfficerName: pgrcOfficer.name,
        receivedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        nextAction: 'Departmental curriculum audit'
      },

      // === DEMONSTRATION SCENARIO 4: Kongu Engineering College (Hostel & Safety Norms) ===
      {
        caseId: 'AICTE-2026-00008',
        institutionId: konguInst._id,
        institutionName: konguInst.name,
        aictePermanentId: konguInst.aictePermanentId,
        category: 'Infrastructure',
        subject: 'Substandard residential hostel drinking water RO purification and food safety certification',
        description: 'Hostel boarders reported recurrent waterborne illnesses due to unserviced RO filtration units and lack of statutory FSSAI compliance in dining halls.',
        priority: 'High',
        status: 'Transferred',
        assignedBureau: 'Public Grievance Redressal Cell (PGRC)',
        assignedOfficer: pgrcOfficer._id,
        assignedOfficerName: pgrcOfficer.name,
        receivedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        nextAction: 'Joint sanitary inspection by District Health Officer and AICTE representative'
      },
      {
        caseId: 'AICTE-2026-00009',
        institutionId: konguInst._id,
        institutionName: konguInst.name,
        aictePermanentId: konguInst.aictePermanentId,
        category: 'Regulatory Compliance',
        subject: 'Non-compliance with AICTE campus environmental hygiene and food handler sanitation regulations',
        description: 'Regional office initiated inspection into sanitary certification, water testing logs, and dining facility guidelines.',
        priority: 'High',
        status: 'Pending',
        assignedBureau: 'Regulation Bureau (RB)',
        assignedOfficer: rbOfficer._id,
        assignedOfficerName: rbOfficer.name,
        receivedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        nextAction: 'Submission of water lab bacteriological test records'
      },

      // === DEMONSTRATION SCENARIO 5: Thiagarajar College of Engineering (TCE), Madurai ===
      {
        caseId: 'AICTE-2026-00010',
        institutionId: tceInst._id,
        institutionName: tceInst.name,
        aictePermanentId: tceInst.aictePermanentId,
        category: 'Infrastructure',
        subject: 'Thiagarajar College of Engineering - Modernization of structural robotics & mechatronics laboratories and safety equipment',
        description: 'Final year engineering students at Thiagarajar College of Engineering (TCE), Madurai submitted formal grievance regarding the urgent need for safety calibration of high-voltage machinery, IoT development boards, and upgraded computer workstations in the advanced mechatronics laboratory.',
        priority: 'High',
        status: 'Under Process',
        assignedBureau: 'Public Grievance Redressal Cell (PGRC)',
        assignedOfficer: pgrcOfficer._id,
        assignedOfficerName: pgrcOfficer.name,
        receivedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        nextAction: 'Joint technical review with Head of Department at TCE Madurai'
      },
      {
        caseId: 'AICTE-2026-00011',
        institutionId: tceInst._id,
        institutionName: tceInst.name,
        aictePermanentId: tceInst.aictePermanentId,
        category: 'Regulatory Compliance',
        subject: 'Thiagarajar College of Engineering - Compliance inspection on AICTE robotics laboratory carpet area and equipment safety norms',
        description: 'Regulatory compliance review initiated by AICTE Southern Regional Office verifying mandatory laboratory floor area, equipment safety clearances, and operational fire retardant measures in the core engineering workshop at Thiagarajar College of Engineering.',
        priority: 'High',
        status: 'Pending',
        assignedBureau: 'Regulation Bureau (RB)',
        assignedOfficer: rbOfficer._id,
        assignedOfficerName: rbOfficer.name,
        receivedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        nextAction: 'Issuance of formal compliance query to Principal, TCE'
      },
      {
        caseId: 'AICTE-2026-00012',
        institutionId: tceInst._id,
        institutionName: tceInst.name,
        aictePermanentId: tceInst.aictePermanentId,
        category: 'Approval and Accreditation',
        subject: 'Thiagarajar College of Engineering - Faculty cadre ratio and AICTE 7th CPC Career Advancement Scheme documentation audit',
        description: 'Annual verification of autonomous academic extension of approval (EoA), doctoral publications, and teacher-student ratio per AICTE 7th CPC norms for newly added B.Tech Computer Science and Business Systems seats at Thiagarajar College of Engineering.',
        priority: 'Medium',
        status: 'Received',
        assignedBureau: 'Approval Bureau',
        assignedOfficer: null,
        assignedOfficerName: 'Unassigned',
        receivedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        expectedDisposalDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
        nextAction: 'Document scrutiny by Southern Regional Committee'
      }
    ];

    // Tamil Nadu specific topics and subjects for remaining complaints
    const tnSubjects = [
      { cat: 'Academic Issues', sub: 'Non-adherence to AICTE model curriculum credit structure for Emerging AI/ML B.Tech electives' },
      { cat: 'Faculty and Staffing', sub: 'Non-disbursement of DA increments and arrears as mandated by AICTE 7th CPC scale' },
      { cat: 'Admission and Fee Issues', sub: 'Refusal to refund tuition fees following seat cancellation within TNEA counseling window' },
      { cat: 'Regulatory Compliance', sub: 'Failure to constitute mandatory Internal Complaints Committee (ICC) under POSH regulations' },
      { cat: 'Student Grievances', sub: 'Dispute over biometric attendance thresholds and arbitrary fine penalties on day-scholars' },
      { cat: 'Infrastructure', sub: 'Inadequate high-speed internet bandwidth and deficit in IEEE / ACM digital library subscriptions' },
      { cat: 'Approval and Accreditation', sub: 'Inaccuracies in faculty cadre profile submitted for annual Extension of Approval (EoA)' },
      { cat: 'Examination-Related Issues', sub: 'Lack of transparent evaluation criteria and revaluation mark disclosure for internal assessments' },
      { cat: 'Regulatory Compliance', sub: 'Non-compliance with AICTE Anti-Ragging squad installation and emergency helpline display' },
      { cat: 'Faculty and Staffing', sub: 'Arbitrary termination of Assistant Professors without mandatory 3-month statutory notice' },
      { cat: 'Student Grievances', sub: 'Unwarranted withholding of original 10th and 12th certificates after completion of degree' },
      { cat: 'Academic Issues', sub: 'Failure to arrange mandatory 4-week industrial internships for core circuit branches' },
      { cat: 'Infrastructure', sub: 'Deficient specialized hardware workstations in VLSI design and robotics laboratories' },
      { cat: 'Admission and Fee Issues', sub: 'Collection of unapproved placement training and personality enhancement fees' },
      { cat: 'Regulatory Compliance', sub: 'Absence of barrier-free disabled access, ramps, and auditory lifts in academic buildings' }
    ];

    let currentCaseNumber = 13;
    for (let i = 0; i < 38; i++) {
      const targetInst = createdInstitutions[(i + 3) % createdInstitutions.length];
      const template = tnSubjects[i % tnSubjects.length];
      const category = template.cat;
      const status = COMPLAINT_STATUSES[i % COMPLAINT_STATUSES.length];
      const priority = COMPLAINT_PRIORITIES[i % COMPLAINT_PRIORITIES.length];
      const bureau = BUREAUS[i % BUREAUS.length];

      const daysAgo = (i * 2) + 3;
      const isPastDisposal = status === 'Disposed' || status === 'Closed';
      const isOverdueDemo = !isPastDisposal && (i % 7 === 0);

      const receivedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const expectedDisposalDate = isOverdueDemo
        ? new Date(Date.now() - (3 + (i % 5)) * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + (18 - (i % 12)) * 24 * 60 * 60 * 1000);

      const disposedAt = isPastDisposal ? new Date(Date.now() - (daysAgo - 6) * 24 * 60 * 60 * 1000) : null;
      const paddedNum = String(currentCaseNumber).padStart(5, '0');
      const caseId = `AICTE-2026-${paddedNum}`;

      const assignedOfficer = bureau.includes('PGRC')
        ? pgrcOfficer
        : bureau.includes('RB')
        ? rbOfficer
        : bureau.includes('Regional')
        ? regionalOfficer
        : null;

      complaintsToCreate.push({
        caseId,
        institutionId: targetInst._id,
        institutionName: targetInst.name,
        aictePermanentId: targetInst.aictePermanentId,
        category,
        subject: `${template.sub} [Case ${caseId}]`,
        description: `Formal representation submitted to AICTE regarding ${template.sub.toLowerCase()} at ${targetInst.name}, located in ${targetInst.district}, Tamil Nadu. The matter has been assigned to ${bureau} for official verification and regulatory compliance monitoring.`,
        priority,
        status,
        assignedBureau: bureau,
        assignedOfficer: assignedOfficer ? assignedOfficer._id : null,
        assignedOfficerName: assignedOfficer ? assignedOfficer.name : 'Unassigned',
        receivedAt,
        expectedDisposalDate,
        disposedAt,
        nextAction: isPastDisposal ? 'Disposed with official compliance order' : 'Under active bureau review'
      });

      currentCaseNumber++;
    }

    // Insert all complaints
    const createdComplaints = await Complaint.insertMany(complaintsToCreate);
    logger.info(`Seeded ${createdComplaints.length} complaints for Tamil Nadu institutions.`);

    // Initialize sequence counter
    await Counter.create({
      name: 'complaint_case_id_2026',
      seq: currentCaseNumber - 1
    });

    // 4. Create Detailed Case Histories for every complaint
    const histories = [];
    for (const comp of createdComplaints) {
      histories.push({
        complaintId: comp._id,
        caseId: comp.caseId,
        actionType: ACTION_TYPES.CREATED,
        previousStatus: null,
        newStatus: 'Received',
        previousBureau: null,
        newBureau: comp.assignedBureau,
        officerId: adminUser._id,
        officerDisplayName: adminUser.name,
        remarks: `Complaint formally logged in AICTE Tamil Nadu Central Registry and assigned to [${comp.assignedBureau}].`,
        createdAt: comp.receivedAt
      });

      if (comp.status !== 'Received') {
        histories.push({
          complaintId: comp._id,
          caseId: comp.caseId,
          actionType: comp.status === 'Disposed' ? ACTION_TYPES.DISPOSED : ACTION_TYPES.STATUS_CHANGE,
          previousStatus: 'Received',
          newStatus: comp.status,
          previousBureau: comp.assignedBureau,
          newBureau: comp.assignedBureau,
          officerId: comp.assignedOfficer || adminUser._id,
          officerDisplayName: comp.assignedOfficerName || adminUser.name,
          remarks: `Case status progressed to [${comp.status}] following committee evaluation by Southern Regional Office.`,
          createdAt: new Date(new Date(comp.receivedAt).getTime() + 4 * 24 * 60 * 60 * 1000)
        });
      }
    }

    await CaseHistory.insertMany(histories);
    logger.info(`Seeded ${histories.length} case history records.`);

    // 5. Run Cross-Bureau Overlap Engine on all Tamil Nadu institutions
    let totalOverlapsDetected = 0;
    for (const inst of createdInstitutions) {
      const detected = await detectOverlapsForInstitution(inst._id);
      totalOverlapsDetected += detected.length;
    }
    logger.info(`Overlap detection engine detected and registered ${totalOverlapsDetected} cross-bureau overlap alerts across Tamil Nadu institutions.`);

    // 6. Notifications for demo dashboard users
    const sampleNotifications = [
      {
        recipientId: pgrcOfficer._id,
        type: 'OVERLAP_DETECTED',
        title: 'High Severity Cross-Bureau Overlap: Thiagarajar College of Engineering (TCE)',
        message: 'Active cases AICTE-2026-00010 (PGRC) and AICTE-2026-00011 (RB) require cross-bureau coordination regarding robotics laboratory equipment and safety compliance at TCE Madurai.',
        caseId: 'AICTE-2026-00010',
        isRead: false
      },
      {
        recipientId: pgrcOfficer._id,
        type: 'OVERLAP_DETECTED',
        title: 'High Severity Cross-Bureau Overlap: PSG College of Technology',
        message: 'Active cases AICTE-2026-00001 (PGRC) and AICTE-2026-00002 (RB) require cross-bureau coordination for laboratory safety compliance.',
        caseId: 'AICTE-2026-00001',
        isRead: false
      },
      {
        recipientId: rbOfficer._id,
        type: 'OVERLAP_DETECTED',
        title: 'Critical Overlap Alert: Rajalakshmi Engineering College',
        message: 'Cases AICTE-2026-00004 (RB) and AICTE-2026-00005 (PGRC) share identical allegations on unapproved fees. Statutory coordination recommended.',
        caseId: 'AICTE-2026-00004',
        isRead: false
      },
      {
        recipientId: adminUser._id,
        type: 'CASE_ESCALATED',
        title: 'Case Escalated to Critical: AICTE-2026-00004',
        message: 'Rajalakshmi Engineering College fee complaint has been escalated to Critical level for urgent hearing.',
        caseId: 'AICTE-2026-00004',
        isRead: false
      },
      {
        recipientId: regionalOfficer._id,
        type: 'CASE_ASSIGNED',
        title: 'Southern Region Inspection Assigned',
        message: 'Coimbatore campus inspection schedule assigned for PSG College of Technology.',
        caseId: 'AICTE-2026-00001',
        isRead: false
      }
    ];

    await Notification.insertMany(sampleNotifications);
    logger.info('Sample notifications created.');

    // 7. Audit Log
    await AuditLog.create({
      actorId: adminUser._id,
      actorName: adminUser.name,
      actorEmail: adminUser.email,
      action: 'SYSTEM_SEED',
      resourceType: 'System',
      resourceId: 'INIT_TN_DB',
      metadata: {
        users: createdUsers.length,
        institutions: createdInstitutions.length,
        complaints: createdComplaints.length,
        overlaps: totalOverlapsDetected,
        regionScope: 'Tamil Nadu (Southern Region)'
      }
    });

    logger.info('Tamil Nadu real-time database seeding finished successfully.');
  } catch (error) {
    logger.error('Error during seeding:', error);
    throw error;
  }
}

// Allow direct execution: node scripts/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      logger.info('Seed process exited cleanly.');
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}
