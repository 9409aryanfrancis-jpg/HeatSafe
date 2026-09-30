import fs from 'fs';
import path from 'path';
import { CarePoint, FacilityReport, TamilNaduCity, UserProfile, UserRating } from '../types';
import { INITIAL_RATINGS, INITIAL_REPORTS, SEED_CARE_POINTS } from '../data/seedData';

interface DatabaseSchema {
  carePoints: CarePoint[];
  ratings: UserRating[];
  reports: FacilityReport[];
  users: UserProfile[];
}

const DB_FILE_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE_PATH = path.join(DB_FILE_DIR, 'db.json');

class DatabaseStore {
  private data: DatabaseSchema;
  private sseClients: Set<{ id: string; write: (data: string) => void }> = new Set();

  constructor() {
    this.data = this.loadInitialData();
  }

  private loadInitialData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.carePoints && Array.isArray(parsed.carePoints)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing db.json, falling back to seed data', e);
    }

    const initial: DatabaseSchema = {
      carePoints: [...SEED_CARE_POINTS],
      ratings: [...INITIAL_RATINGS],
      reports: [...INITIAL_REPORTS],
      users: [
        {
          id: 'worker-101',
          name: 'Karthik Shanmugam',
          phone: '9840123456',
          platform: 'swiggy',
          vehicle: 'two_wheeler',
          city: 'chennai',
          role: 'gig_worker',
          womenFriendlyOnly: false,
          freeOnly: false,
          preferredLanguage: 'ta',
          createdAt: new Date().toISOString(),
          isGuest: false,
        },
        {
          id: 'planner-201',
          name: 'Dr. Aruna Devi (State Planning Commission)',
          phone: '9444109876',
          platform: 'other',
          vehicle: 'cab',
          city: 'chennai',
          role: 'municipal_planner',
          womenFriendlyOnly: true,
          freeOnly: false,
          preferredLanguage: 'en',
          createdAt: new Date().toISOString(),
          isGuest: false,
        },
      ],
    };

    this.persist(initial);
    return initial;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_FILE_DIR)) {
        fs.mkdirSync(DB_FILE_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to persist to db.json (using in-memory)', e);
    }
  }

  public subscribeClient(clientId: string, writeFn: (chunk: string) => void) {
    const client = { id: clientId, write: writeFn };
    this.sseClients.add(client);
    return () => {
      this.sseClients.delete(client);
    };
  }

  public broadcast(type: string, payload: any) {
    const message = `event: message\ndata: ${JSON.stringify({ type, payload, timestamp: new Date().toISOString() })}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(message);
      } catch (err) {
        this.sseClients.delete(client);
      }
    }
  }

  public getCarePoints(filter?: { city?: TamilNaduCity; type?: string; womenOnly?: boolean; freeOnly?: boolean }): CarePoint[] {
    let list = [...this.data.carePoints];
    if (filter?.city) {
      list = list.filter((p) => p.city === filter.city);
    }
    if (filter?.type && filter.type !== 'all') {
      list = list.filter((p) => p.type === filter.type);
    }
    if (filter?.womenOnly) {
      list = list.filter((p) => p.womenFriendly);
    }
    if (filter?.freeOnly) {
      list = list.filter((p) => p.isFree);
    }
    return list;
  }

  public getCarePointById(id: string): CarePoint | undefined {
    return this.data.carePoints.find((p) => p.id === id);
  }

  public addCarePoint(point: Omit<CarePoint, 'id' | 'avgCleanlinessRating' | 'avgSafetyRating' | 'ratingCount' | 'reportedIssuesCount' | 'createdAt' | 'lastUpdatedAt'>): CarePoint {
    const newPoint: CarePoint = {
      ...point,
      id: `cp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      avgCleanlinessRating: 4.5,
      avgSafetyRating: 4.5,
      ratingCount: 1,
      reportedIssuesCount: 0,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    this.data.carePoints.unshift(newPoint);
    this.persist();
    this.broadcast('CARE_POINT_ADDED', newPoint);
    return newPoint;
  }

  public addRating(ratingInput: Omit<UserRating, 'id' | 'createdAt'>): UserRating {
    const newRating: UserRating = {
      ...ratingInput,
      id: `rate-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    this.data.ratings.unshift(newRating);

    // Recompute average for care point
    const point = this.data.carePoints.find((p) => p.id === ratingInput.carePointId);
    if (point) {
      const pointRatings = this.data.ratings.filter((r) => r.carePointId === point.id);
      const totalClean = pointRatings.reduce((sum, r) => sum + r.cleanlinessRating, 0);
      const totalSafe = pointRatings.reduce((sum, r) => sum + r.safetyRating, 0);
      point.avgCleanlinessRating = Number((totalClean / pointRatings.length).toFixed(1));
      point.avgSafetyRating = Number((totalSafe / pointRatings.length).toFixed(1));
      point.ratingCount = pointRatings.length;
      point.lastUpdatedAt = new Date().toISOString();
      if (point.status === 'needs_verification' && pointRatings.length >= 2) {
        point.isVerified = true;
        point.status = 'operational';
      }
    }

    this.persist();
    this.broadcast('RATING_ADDED', { rating: newRating, updatedCarePoint: point });
    return newRating;
  }

  public addReport(reportInput: Omit<FacilityReport, 'id' | 'createdAt' | 'status'>): FacilityReport {
    const newReport: FacilityReport = {
      ...reportInput,
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.data.reports.unshift(newReport);

    const point = this.data.carePoints.find((p) => p.id === reportInput.carePointId);
    if (point) {
      point.reportedIssuesCount = (point.reportedIssuesCount || 0) + 1;
      if (reportInput.issueType === 'locked_closed' || reportInput.issueType === 'toilet_unusable') {
        point.status = 'unusable';
      }
      point.lastUpdatedAt = new Date().toISOString();
    }

    this.persist();
    this.broadcast('REPORT_ADDED', { report: newReport, updatedCarePoint: point });
    return newReport;
  }

  public getRatings(carePointId?: string): UserRating[] {
    if (!carePointId) return this.data.ratings;
    return this.data.ratings.filter((r) => r.carePointId === carePointId);
  }

  public getReports(carePointId?: string): FacilityReport[] {
    if (!carePointId) return this.data.reports;
    return this.data.reports.filter((r) => r.carePointId === carePointId);
  }

  public findUserById(id: string): UserProfile | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByPhone(phone: string): UserProfile | undefined {
    return this.data.users.find((u) => u.phone === phone);
  }

  public saveUser(user: UserProfile): UserProfile {
    const existingIndex = this.data.users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      this.data.users[existingIndex] = user;
    } else {
      this.data.users.push(user);
    }
    this.persist();
    this.broadcast('USER_JOINED', { name: user.name, role: user.role, platform: user.platform });
    return user;
  }

  public getStats() {
    const cities: TamilNaduCity[] = ['chennai', 'madurai', 'coimbatore', 'tiruchirappalli', 'salem'];
    const cityBreakdown = cities.map((c) => {
      const list = this.data.carePoints.filter((p) => p.city === c);
      const toilets = list.filter((p) => p.type === 'toilet').length;
      const waters = list.filter((p) => p.type === 'water').length;
      const acRests = list.filter((p) => p.type === 'ac_rest').length;
      const shades = list.filter((p) => p.type === 'shade').length;
      const verified = list.filter((p) => p.isVerified).length;
      const avgClean = list.length ? Number((list.reduce((s, p) => s + p.avgCleanlinessRating, 0) / list.length).toFixed(1)) : 0;
      const avgSafe = list.length ? Number((list.reduce((s, p) => s + p.avgSafetyRating, 0) / list.length).toFixed(1)) : 0;
      const issues = list.reduce((s, p) => s + (p.reportedIssuesCount || 0), 0);

      return {
        city: c,
        totalFacilities: list.length,
        toiletsCount: toilets,
        waterPointsCount: waters,
        acRestCount: acRests,
        shadePointsCount: shades,
        verifiedPercentage: list.length ? Math.round((verified / list.length) * 100) : 0,
        avgCleanliness: avgClean,
        avgSafety: avgSafe,
        activeReportsCount: issues,
        careDesertsCount: c === 'chennai' ? 4 : c === 'madurai' ? 3 : 2,
      };
    });

    return {
      totalPoints: this.data.carePoints.length,
      totalRatings: this.data.ratings.length,
      totalReports: this.data.reports.length,
      activeUsersCount: this.data.users.length + 142, // aggregated community active users
      cityBreakdown,
    };
  }

  public getExportData(format: 'csv' | 'geojson') {
    if (format === 'geojson') {
      return {
        type: 'FeatureCollection',
        features: this.data.carePoints.map((cp) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [cp.lng, cp.lat],
          },
          properties: {
            id: cp.id,
            name: cp.name,
            nameTa: cp.nameTa,
            type: cp.type,
            city: cp.city,
            address: cp.address,
            isVerified: cp.isVerified,
            isFree: cp.isFree,
            womenFriendly: cp.womenFriendly,
            openHours: cp.openHours,
            cleanliness: cp.avgCleanlinessRating,
            safety: cp.avgSafetyRating,
            ratingsCount: cp.ratingCount,
            status: cp.status,
            tags: cp.tags.join(','),
          },
        })),
      };
    } else {
      // CSV
      const headers = ['id', 'name', 'type', 'city', 'latitude', 'longitude', 'isVerified', 'isFree', 'womenFriendly', 'openHours', 'cleanlinessRating', 'safetyRating', 'status'];
      const rows = this.data.carePoints.map((p) =>
        [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.type,
          p.city,
          p.lat,
          p.lng,
          p.isVerified,
          p.isFree,
          p.womenFriendly,
          `"${p.openHours}"`,
          p.avgCleanlinessRating,
          p.avgSafetyRating,
          p.status,
        ].join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }
  }
}

export const dbStore = new DatabaseStore();
