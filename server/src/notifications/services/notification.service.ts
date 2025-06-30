import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus, NotificationChannel } from '../entities/notification.entity';
import { User } from '../../admin/entities/user.entity';
import { Issue } from '../../ai-solutions/entities/issue.entity';
import { Business } from '../../admin/entities/business.entity';
import { PushNotificationService } from './push-notification.service';

export interface CreateNotificationDto {
  userId: number;
  businessId: number;
  issueId?: number;
  type: NotificationType;
  title: string;
  message: string;
  channels?: NotificationChannel[];
  data?: {
    issueId?: number;
    routeTo?: string;
    routeParams?: any;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionRequired?: boolean;
    expiresAt?: string;
  };
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private pushNotificationService: PushNotificationService,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    const business = await this.businessRepository.findOne({ where: { id: dto.businessId } });
    
    let issue = null;
    if (dto.issueId) {
      issue = await this.issueRepository.findOne({ where: { id: dto.issueId } });
    }

    const notification = this.notificationRepository.create({
      user,
      business,
      issue,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      channels: dto.channels || [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      data: {
        ...dto.data,
        issueId: dto.issueId,
        routeTo: 'IssueDetails',
        routeParams: dto.issueId ? { 
          issueId: dto.issueId, 
          businessId: dto.businessId,
          userId: dto.userId 
        } : undefined,
      },
      status: NotificationStatus.PENDING,
    });

    const savedNotification = await this.notificationRepository.save(notification);
    
    // Send notification immediately
    await this.sendNotification(savedNotification.id);
    
    return savedNotification;
  }

  async sendNotification(notificationId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
      relations: ['user', 'business', 'issue'],
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    try {
      // Send push notification if channel is enabled
      if (notification.channels.includes(NotificationChannel.PUSH)) {
        await this.pushNotificationService.sendPushNotification({
          userId: notification.user.id,
          title: notification.title,
          message: notification.message,
          data: notification.data,
        });
      }

      // Update notification status
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      await this.notificationRepository.save(notification);

    } catch (error) {
      console.error('Failed to send notification:', error);
      notification.status = NotificationStatus.FAILED;
      await this.notificationRepository.save(notification);
      throw error;
    }
  }

  async createIssueAssignmentNotification(
    issueId: number,
    assignedUserId: number,
    assignedByUserId: number
  ): Promise<Notification> {
    const issue = await this.issueRepository.findOne({
      where: { id: issueId },
      relations: ['business', 'problem', 'equipment', 'openedBy'],
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    const assignedUser = await this.userRepository.findOne({ 
      where: { id: assignedUserId } 
    });
    
    const assignedByUser = await this.userRepository.findOne({ 
      where: { id: assignedByUserId } 
    });

    if (!assignedUser) {
      throw new Error('Assigned user not found');
    }

    const title = `New Issue Assignment #${issue.id}`;
    const message = `You have been assigned to issue "${issue.problem?.description?.substring(0, 50)}..." by ${assignedByUser?.name || 'System'}`;

    return this.createNotification({
      userId: assignedUserId,
      businessId: issue.business.id,
      issueId: issue.id,
      type: NotificationType.ISSUE_ASSIGNED,
      title,
      message,
      channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      data: {
        issueId: issue.id,
        priority: 'high',
        actionRequired: true,
        routeTo: 'IssueDetails',
        routeParams: {
          issueId: issue.id,
          businessId: issue.business.id,
          userId: assignedUserId,
        },
      },
    });
  }

  async createIssueStatusChangeNotification(
    issueId: number,
    newStatus: string,
    changedByUserId: number
  ): Promise<void> {
    const issue = await this.issueRepository.findOne({
      where: { id: issueId },
      relations: ['business', 'problem', 'openedBy', 'assignedTo'],
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    const changedByUser = await this.userRepository.findOne({ 
      where: { id: changedByUserId } 
    });

    // Notify the issue opener (if different from the person making the change)
    if (issue.openedBy && issue.openedBy.id !== changedByUserId) {
      await this.createNotification({
        userId: issue.openedBy.id,
        businessId: issue.business.id,
        issueId: issue.id,
        type: NotificationType.ISSUE_STATUS_CHANGED,
        title: `Issue #${issue.id} Status Updated`,
        message: `Your issue status changed to "${newStatus}" by ${changedByUser?.name || 'System'}`,
        data: {
          issueId: issue.id,
          priority: 'medium',
        },
      });
    }

    // Notify the assigned technician (if different from the person making the change)
    if (issue.assignedTo && issue.assignedTo.id !== changedByUserId) {
      await this.createNotification({
        userId: issue.assignedTo.id,
        businessId: issue.business.id,
        issueId: issue.id,
        type: NotificationType.ISSUE_STATUS_CHANGED,
        title: `Assigned Issue #${issue.id} Status Updated`,
        message: `Issue status changed to "${newStatus}" by ${changedByUser?.name || 'System'}`,
        data: {
          issueId: issue.id,
          priority: 'medium',
        },
      });
    }
  }

  async getUserNotifications(
    userId: number,
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      businessId?: number;
    } = {}
  ): Promise<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const { page = 1, limit = 20, unreadOnly = false, businessId } = options;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .leftJoinAndSelect('notification.business', 'business')
      .leftJoinAndSelect('notification.issue', 'issue')
      .where('notification.userId = :userId', { userId });

    if (unreadOnly) {
      queryBuilder.andWhere('notification.readAt IS NULL');
    }

    if (businessId) {
      queryBuilder.andWhere('notification.businessId = :businessId', { businessId });
    }

    queryBuilder.orderBy('notification.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.readAt = new Date();
    await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number, businessId?: number): Promise<void> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('readAt IS NULL');

    if (businessId) {
      queryBuilder.andWhere('businessId = :businessId', { businessId });
    }

    await queryBuilder.execute();
  }

  // Test notification creation
  async createTestNotification(userId: number, businessId: number): Promise<Notification> {
    // Check if user exists, if not create a test user
    let user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      user = this.userRepository.create({
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
      });
      await this.userRepository.save(user);
    }

    // Check if business exists, if not create a test business
    let business = await this.businessRepository.findOne({ where: { id: businessId } });
    if (!business) {
      business = this.businessRepository.create({
        id: businessId,
        name: 'Test Business',
        address: 'Test Address',
      });
      await this.businessRepository.save(business);
    }

    return this.createNotification({
      userId,
      businessId,
      type: NotificationType.ISSUE_ASSIGNED,
      title: '🔔 Test Notification',
      message: 'This is a test notification to verify the system is working correctly!',
      channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      data: {
        priority: 'medium',
        actionRequired: false,
      },
    });
  }
} 