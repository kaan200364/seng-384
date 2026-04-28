import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConfidentialityLevel,
  PostStatus,
  UserRole,
} from '../generated/prisma/enums';

@Injectable()
export class DemoSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const userCount = await this.prisma.user.count();
    if (userCount > 0) {
      return;
    }

    const password = await bcrypt.hash('demo123', 10);

    const [engineer, doctor, admin] = await Promise.all([
      this.prisma.user.create({
        data: {
          email: 'engineer@metu.edu',
          password,
          fullName: 'Kaan Turkay',
          role: UserRole.ENGINEER,
          institution: 'Middle East Technical University',
          expertise: 'Machine Learning, Product Design',
          city: 'Ankara',
          bio: 'Engineer focused on healthcare AI workflows and partnership discovery.',
          emailVerified: true,
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'doctor@hacettepe.edu',
          password,
          fullName: 'Dr. Elif Kaya',
          role: UserRole.HEALTHCARE_PROFESSIONAL,
          institution: 'Hacettepe University Hospital',
          expertise: 'Radiology, Clinical Validation',
          city: 'Ankara',
          bio: 'Healthcare professional interested in AI-assisted clinical validation projects.',
          emailVerified: true,
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'admin@healthai.edu',
          password,
          fullName: 'Aylin Demir',
          role: UserRole.ADMIN,
          institution: 'Health AI Program Office',
          expertise: 'Moderation, Governance',
          city: 'Istanbul',
          bio: 'Platform administrator responsible for moderation and audit review.',
          emailVerified: true,
        },
      }),
    ]);

    await this.prisma.post.createMany({
      data: [
        {
          title: 'AI-Assisted Cardiology Diagnosis',
          domain: 'Cardiology',
          requiredExpertise: 'Machine Learning Engineer',
          projectStage: 'Research',
          confidentialityLevel: ConfidentialityLevel.PUBLIC,
          city: 'Ankara',
          description:
            'Looking for an engineer to help validate ECG-based diagnostic workflows.',
          status: PostStatus.ACTIVE,
          authorId: doctor.id,
          createdAt: new Date('2026-03-10T09:00:00.000Z'),
          updatedAt: new Date('2026-03-10T09:00:00.000Z'),
        },
        {
          title: 'Radiology Support Tool Prototype',
          domain: 'Radiology',
          requiredExpertise: 'Frontend Engineer',
          projectStage: 'Prototype',
          confidentialityLevel: ConfidentialityLevel.CONFIDENTIAL,
          city: 'Istanbul',
          description:
            'Prototype support is needed for a decision-support interface used in imaging workflows.',
          status: PostStatus.DRAFT,
          authorId: engineer.id,
          createdAt: new Date('2026-03-11T09:00:00.000Z'),
          updatedAt: new Date('2026-03-11T09:00:00.000Z'),
        },
        {
          title: 'Orthopedics Data Labeling Collaboration',
          domain: 'Orthopedics',
          requiredExpertise: 'Data Scientist',
          projectStage: 'Idea',
          confidentialityLevel: ConfidentialityLevel.PUBLIC,
          city: 'Izmir',
          description:
            'Seeking a collaborator to shape a labeling workflow for orthopedics outcome analysis.',
          status: PostStatus.ACTIVE,
          authorId: engineer.id,
          createdAt: new Date('2026-03-12T09:00:00.000Z'),
          updatedAt: new Date('2026-03-12T09:00:00.000Z'),
        },
      ],
    });

    await this.prisma.notification.createMany({
      data: [
        {
          userId: engineer.id,
          title: 'Welcome',
          message: 'Your demo engineer account is ready.',
        },
        {
          userId: doctor.id,
          title: 'Welcome',
          message: 'Your demo healthcare professional account is ready.',
        },
        {
          userId: admin.id,
          title: 'Welcome',
          message: 'Your admin dashboard is ready for moderation flows.',
        },
      ],
    });
  }
}
