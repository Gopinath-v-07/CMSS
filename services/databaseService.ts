
import { User, Complaint, Role, ComplaintStatus, ComplaintCategory, ComplaintPriority } from '../types';

class DatabaseService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem('cms_users')) {
      const initialAdmin: User = {
        id: 'admin-001',
        name: 'System Administrator',
        email: 'admin@university.com',
        password: 'admin',
        role: Role.ADMIN
      };
      localStorage.setItem('cms_users', JSON.stringify([initialAdmin]));
    }
    if (!localStorage.getItem('cms_complaints')) {
      // Add some sample data to match the screenshot look
      const samples: Complaint[] = [
        {
          id: 'C-001',
          studentId: 'stud-001',
          studentName: 'gopi',
          subject: 'Food Quality is Bad',
          description: 'The food served in the mess is of very poor quality recently.',
          status: ComplaintStatus.UNDER_REVIEW,
          category: ComplaintCategory.HOSTEL,
          priority: ComplaintPriority.MEDIUM,
          remarks: '',
          createdAt: new Date('2026-01-29T22:29:34').toISOString()
        },
        {
          id: 'C-002',
          studentId: 'stud-002',
          studentName: 'Arya',
          subject: 'Lavanya',
          description: 'Staff behavior issue during library hours.',
          status: ComplaintStatus.UNDER_REVIEW,
          category: ComplaintCategory.STAFF,
          priority: ComplaintPriority.LOW,
          remarks: '',
          createdAt: new Date('2025-12-30T20:34:34').toISOString()
        }
      ];
      localStorage.setItem('cms_complaints', JSON.stringify(samples));
    }
  }

  private delay(ms: number = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getUsers(): Promise<User[]> {
    await this.delay(200);
    return JSON.parse(localStorage.getItem('cms_users') || '[]');
  }

  async saveUser(user: User): Promise<void> {
    await this.delay(400);
    const users = await this.getUsers();
    users.push(user);
    localStorage.setItem('cms_users', JSON.stringify(users));
  }

  async getComplaints(): Promise<Complaint[]> {
    await this.delay(300);
    return JSON.parse(localStorage.getItem('cms_complaints') || '[]');
  }

  async saveComplaint(complaint: Complaint): Promise<void> {
    await this.delay(500);
    const complaints = await this.getComplaints();
    complaints.push(complaint);
    localStorage.setItem('cms_complaints', JSON.stringify(complaints));
  }

  async updateComplaint(updated: Complaint): Promise<void> {
    await this.delay(400);
    const complaints = await this.getComplaints();
    const index = complaints.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      complaints[index] = updated;
      localStorage.setItem('cms_complaints', JSON.stringify(complaints));
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const user = localStorage.getItem('cms_current_user');
    return user ? JSON.parse(user) : null;
  }

  async setCurrentUser(user: User | null): Promise<void> {
    if (user) {
      localStorage.setItem('cms_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cms_current_user');
    }
  }
}

export const db = new DatabaseService();
