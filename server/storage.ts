import {
  users,
  indicators,
  criteria,
  witnesses,
  strategies,
  userStrategies,
  capabilities,
  changes,
  signatures,
  type User,
  type UpsertUser,
  type Indicator,
  type InsertIndicator,
  type Criteria,
  type InsertCriteria,
  type Witness,
  type InsertWitness,
  type Strategy,
  type InsertStrategy,
  type Capability,
  type Change,
  type Signature,
  type InsertSignature,
  type IndicatorWithCriteria,
  type DashboardStats,
  type SignatureWithDetails,
  type PrincipalDashboardStats,
  type TeacherWithStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
  getAllTeachers(): Promise<TeacherWithStats[]>;
  
  getIndicators(userId?: string): Promise<IndicatorWithCriteria[]>;
  getIndicator(id: string): Promise<IndicatorWithCriteria | undefined>;
  createIndicator(data: InsertIndicator): Promise<Indicator>;
  updateIndicator(id: string, data: Partial<InsertIndicator>): Promise<Indicator | undefined>;
  deleteIndicator(id: string): Promise<boolean>;
  
  getCriteria(indicatorId: string): Promise<Criteria[]>;
  getCriteriaById(id: string): Promise<Criteria | undefined>;
  createCriteria(data: InsertCriteria): Promise<Criteria>;
  updateCriteria(id: string, data: Partial<InsertCriteria>): Promise<Criteria | undefined>;
  deleteCriteria(id: string): Promise<boolean>;
  
  getWitnesses(indicatorId?: string): Promise<Witness[]>;
  getWitnessById(id: string): Promise<Witness | undefined>;
  createWitness(data: InsertWitness): Promise<Witness>;
  deleteWitness(id: string): Promise<boolean>;
  
  getStrategies(): Promise<Strategy[]>;
  createStrategy(data: InsertStrategy): Promise<Strategy>;
  
  getUserStrategies(userId: string): Promise<Strategy[]>;
  setUserStrategies(userId: string, strategyIds: string[]): Promise<void>;
  
  getCapabilities(): Promise<Capability[]>;
  getChanges(): Promise<Change[]>;
  
  getStats(userId?: string): Promise<DashboardStats>;
  getPrincipalStats(): Promise<PrincipalDashboardStats>;
  reEvaluateIndicators(indicatorIds: string[]): Promise<void>;
  
  // Signature methods
  createSignature(data: InsertSignature): Promise<Signature>;
  getSignature(id: string): Promise<SignatureWithDetails | undefined>;
  getSignaturesByTeacher(teacherId: string): Promise<SignatureWithDetails[]>;
  getPendingSignatures(): Promise<SignatureWithDetails[]>;
  updateSignature(id: string, data: Partial<InsertSignature>): Promise<Signature | undefined>;
  approveSignature(id: string, principalId: string, notes?: string): Promise<Signature | undefined>;
  rejectSignature(id: string, principalId: string, notes?: string): Promise<Signature | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getIndicators(userId?: string): Promise<IndicatorWithCriteria[]> {
    const indicatorsList = userId 
      ? await db.select().from(indicators).where(eq(indicators.userId, userId)).orderBy(indicators.order)
      : await db.select().from(indicators).orderBy(indicators.order);
    
    const result: IndicatorWithCriteria[] = [];
    
    for (const indicator of indicatorsList) {
      const criteriaList = await db.select().from(criteria).where(eq(criteria.indicatorId, indicator.id)).orderBy(criteria.order);
      result.push({
        ...indicator,
        criteria: criteriaList,
      });
    }
    
    return result;
  }

  async getIndicator(id: string): Promise<IndicatorWithCriteria | undefined> {
    const [indicator] = await db.select().from(indicators).where(eq(indicators.id, id));
    if (!indicator) return undefined;
    
    const criteriaList = await db.select().from(criteria).where(eq(criteria.indicatorId, id)).orderBy(criteria.order);
    
    return {
      ...indicator,
      criteria: criteriaList,
    };
  }

  async createIndicator(data: InsertIndicator): Promise<Indicator> {
    const [indicator] = await db.insert(indicators).values(data).returning();
    return indicator;
  }

  async updateIndicator(id: string, data: Partial<InsertIndicator>): Promise<Indicator | undefined> {
    const [updated] = await db
      .update(indicators)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(indicators.id, id))
      .returning();
    return updated;
  }

  async deleteIndicator(id: string): Promise<boolean> {
    const result = await db.delete(indicators).where(eq(indicators.id, id));
    return true;
  }

  async getCriteria(indicatorId: string): Promise<Criteria[]> {
    return db.select().from(criteria).where(eq(criteria.indicatorId, indicatorId)).orderBy(criteria.order);
  }

  async getCriteriaById(id: string): Promise<Criteria | undefined> {
    const [criterion] = await db.select().from(criteria).where(eq(criteria.id, id));
    return criterion;
  }

  async createCriteria(data: InsertCriteria): Promise<Criteria> {
    const [criterion] = await db.insert(criteria).values(data).returning();
    return criterion;
  }

  async updateCriteria(id: string, data: Partial<InsertCriteria>): Promise<Criteria | undefined> {
    const [updated] = await db
      .update(criteria)
      .set(data)
      .where(eq(criteria.id, id))
      .returning();
    return updated;
  }

  async deleteCriteria(id: string): Promise<boolean> {
    await db.delete(criteria).where(eq(criteria.id, id));
    return true;
  }

  async getWitnesses(indicatorId?: string): Promise<Witness[]> {
    if (indicatorId) {
      return db.select().from(witnesses).where(eq(witnesses.indicatorId, indicatorId));
    }
    return db.select().from(witnesses);
  }

  async getWitnessById(id: string): Promise<Witness | undefined> {
    const [witness] = await db.select().from(witnesses).where(eq(witnesses.id, id));
    return witness;
  }

  async createWitness(data: InsertWitness): Promise<Witness> {
    const [witness] = await db.insert(witnesses).values(data).returning();
    
    if (data.indicatorId) {
      const witnessCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(witnesses)
        .where(eq(witnesses.indicatorId, data.indicatorId));
      
      await db
        .update(indicators)
        .set({ witnessCount: Number(witnessCount[0]?.count || 0), updatedAt: new Date() })
        .where(eq(indicators.id, data.indicatorId));
    }
    
    return witness;
  }

  async deleteWitness(id: string): Promise<boolean> {
    const [witness] = await db.select().from(witnesses).where(eq(witnesses.id, id));
    
    await db.delete(witnesses).where(eq(witnesses.id, id));
    
    if (witness?.indicatorId) {
      const witnessCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(witnesses)
        .where(eq(witnesses.indicatorId, witness.indicatorId));
      
      await db
        .update(indicators)
        .set({ witnessCount: Number(witnessCount[0]?.count || 0), updatedAt: new Date() })
        .where(eq(indicators.id, witness.indicatorId));
    }
    
    return true;
  }

  async getStrategies(): Promise<Strategy[]> {
    return db.select().from(strategies).where(eq(strategies.isActive, true));
  }

  async createStrategy(data: InsertStrategy): Promise<Strategy> {
    const [strategy] = await db.insert(strategies).values(data).returning();
    return strategy;
  }

  async getUserStrategies(userId: string): Promise<Strategy[]> {
    const userStrategyList = await db
      .select()
      .from(userStrategies)
      .where(eq(userStrategies.userId, userId));
    
    if (userStrategyList.length === 0) return [];
    
    const strategyIds = userStrategyList.map(us => us.strategyId).filter((id): id is string => id !== null);
    
    if (strategyIds.length === 0) return [];
    
    const result: Strategy[] = [];
    for (const id of strategyIds) {
      const [strategy] = await db.select().from(strategies).where(eq(strategies.id, id));
      if (strategy) result.push(strategy);
    }
    
    return result;
  }

  async setUserStrategies(userId: string, strategyIds: string[]): Promise<void> {
    await db.delete(userStrategies).where(eq(userStrategies.userId, userId));
    
    if (strategyIds.length > 0) {
      await db.insert(userStrategies).values(
        strategyIds.map(strategyId => ({
          userId,
          strategyId,
        }))
      );
    }
  }

  async getCapabilities(): Promise<Capability[]> {
    return db.select().from(capabilities).orderBy(capabilities.order);
  }

  async getChanges(): Promise<Change[]> {
    return db.select().from(changes).orderBy(changes.order);
  }

  async getStats(userId?: string): Promise<DashboardStats> {
    const indicatorsList = userId
      ? await db.select().from(indicators).where(eq(indicators.userId, userId))
      : await db.select().from(indicators);
    
    const capabilitiesList = await db.select().from(capabilities);
    const changesList = await db.select().from(changes);
    const witnessesList = userId
      ? await db.select().from(witnesses).where(eq(witnesses.userId, userId))
      : await db.select().from(witnesses);
    
    const totalIndicators = indicatorsList.length;
    const completedIndicators = indicatorsList.filter(i => i.status === "completed").length;
    const pendingIndicators = indicatorsList.filter(i => i.status === "pending").length;
    const inProgressIndicators = indicatorsList.filter(i => i.status === "in_progress").length;
    const totalWitnesses = witnessesList.length;
    
    return {
      totalCapabilities: capabilitiesList.length || 12,
      totalChanges: changesList.length || 12,
      totalIndicators,
      completedIndicators,
      pendingIndicators,
      inProgressIndicators,
      totalWitnesses,
    };
  }

  async reEvaluateIndicators(indicatorIds: string[]): Promise<void> {
    for (const id of indicatorIds) {
      await db
        .update(indicators)
        .set({ status: "pending", witnessCount: 0, updatedAt: new Date() })
        .where(eq(indicators.id, id));
      
      await db
        .update(criteria)
        .set({ isCompleted: false })
        .where(eq(criteria.indicatorId, id));
      
      await db.delete(witnesses).where(eq(witnesses.indicatorId, id));
    }
  }

  // Get all teachers with their stats
  async getAllTeachers(): Promise<TeacherWithStats[]> {
    const teachersList = await db.select().from(users).where(eq(users.role, "teacher"));
    
    const result: TeacherWithStats[] = [];
    for (const teacher of teachersList) {
      const teacherIndicators = await db.select().from(indicators).where(eq(indicators.userId, teacher.id));
      const pendingSignatures = await db.select().from(signatures).where(
        and(eq(signatures.teacherId, teacher.id), eq(signatures.status, "pending"))
      );
      
      result.push({
        ...teacher,
        indicatorCount: teacherIndicators.length,
        completedCount: teacherIndicators.filter(i => i.status === "completed").length,
        pendingApprovalCount: pendingSignatures.length,
      });
    }
    
    return result;
  }

  // Principal dashboard stats
  async getPrincipalStats(): Promise<PrincipalDashboardStats> {
    const baseStats = await this.getStats();
    
    const allTeachers = await db.select().from(users).where(eq(users.role, "teacher"));
    const allSignatures = await db.select().from(signatures);
    
    return {
      ...baseStats,
      totalTeachers: allTeachers.length,
      pendingApprovals: allSignatures.filter(s => s.status === "pending").length,
      approvedIndicators: allSignatures.filter(s => s.status === "approved").length,
      rejectedIndicators: allSignatures.filter(s => s.status === "rejected").length,
    };
  }

  // Signature methods
  async createSignature(data: InsertSignature): Promise<Signature> {
    const [signature] = await db.insert(signatures).values(data).returning();
    return signature;
  }

  async getSignature(id: string): Promise<SignatureWithDetails | undefined> {
    const [signature] = await db.select().from(signatures).where(eq(signatures.id, id));
    if (!signature) return undefined;
    
    const teacher = signature.teacherId ? await this.getUser(signature.teacherId) : undefined;
    const principal = signature.principalId ? await this.getUser(signature.principalId) : undefined;
    const indicator = signature.indicatorId ? await this.getIndicator(signature.indicatorId) : undefined;
    
    return {
      ...signature,
      teacher,
      principal,
      indicator,
    };
  }

  async getSignaturesByTeacher(teacherId: string): Promise<SignatureWithDetails[]> {
    const signaturesList = await db.select().from(signatures).where(eq(signatures.teacherId, teacherId));
    
    const result: SignatureWithDetails[] = [];
    for (const signature of signaturesList) {
      const teacher = signature.teacherId ? await this.getUser(signature.teacherId) : undefined;
      const principal = signature.principalId ? await this.getUser(signature.principalId) : undefined;
      const indicator = signature.indicatorId ? await this.getIndicator(signature.indicatorId) : undefined;
      
      result.push({
        ...signature,
        teacher,
        principal,
        indicator,
      });
    }
    
    return result;
  }

  async getPendingSignatures(): Promise<SignatureWithDetails[]> {
    const signaturesList = await db.select().from(signatures).where(eq(signatures.status, "pending"));
    
    const result: SignatureWithDetails[] = [];
    for (const signature of signaturesList) {
      const teacher = signature.teacherId ? await this.getUser(signature.teacherId) : undefined;
      const principal = signature.principalId ? await this.getUser(signature.principalId) : undefined;
      const indicator = signature.indicatorId ? await this.getIndicator(signature.indicatorId) : undefined;
      
      result.push({
        ...signature,
        teacher,
        principal,
        indicator,
      });
    }
    
    return result;
  }

  async updateSignature(id: string, data: Partial<InsertSignature>): Promise<Signature | undefined> {
    const [updated] = await db
      .update(signatures)
      .set(data)
      .where(eq(signatures.id, id))
      .returning();
    return updated;
  }

  async approveSignature(id: string, principalId: string, notes?: string): Promise<Signature | undefined> {
    const [updated] = await db
      .update(signatures)
      .set({
        status: "approved",
        principalId,
        notes,
        signedAt: new Date(),
      })
      .where(eq(signatures.id, id))
      .returning();
    return updated;
  }

  async rejectSignature(id: string, principalId: string, notes?: string): Promise<Signature | undefined> {
    const [updated] = await db
      .update(signatures)
      .set({
        status: "rejected",
        principalId,
        notes,
        signedAt: new Date(),
      })
      .where(eq(signatures.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
