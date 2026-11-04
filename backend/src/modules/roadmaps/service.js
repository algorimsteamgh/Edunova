import { roadmapRepository } from './repository.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

export class RoadmapService {
  async listRoadmaps(filters = {}) {
    const roadmaps = roadmapRepository.findAll(filters);
    return roadmaps.map((r) => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || []),
      skills_covered: typeof r.skills_covered === 'string' ? JSON.parse(r.skills_covered || '[]') : (r.skills_covered || []),
      prerequisites_list: typeof r.prerequisites_list === 'string' ? JSON.parse(r.prerequisites_list || '[]') : (r.prerequisites_list || []),
      related_roadmap_ids: typeof r.related_roadmap_ids === 'string' ? JSON.parse(r.related_roadmap_ids || '[]') : (r.related_roadmap_ids || []),
    }));
  }

  async getRoadmapDetails(idOrSlug, studentId = null) {
    const roadmap = roadmapRepository.findByIdOrSlug(idOrSlug);
    if (!roadmap) {
      throw new NotFoundError(`Roadmap not found: ${idOrSlug}`);
    }

    const modulesRaw = roadmapRepository.findModules(roadmap.id);
    const topicsRaw = roadmapRepository.findTopics(roadmap.id);
    let progressMap = {};

    if (studentId) {
      const userProgress = roadmapRepository.getUserTopicProgress(studentId, roadmap.id);
      for (const p of userProgress) {
        progressMap[p.topic_id] = (p.is_completed === 1 || p.status === 'completed') ? 'completed' : (p.status || 'in_progress');
      }
    }

    const topics = topicsRaw.map((t, idx) => {
      const prerequisites = typeof t.prerequisites === 'string' ? JSON.parse(t.prerequisites || '[]') : (t.prerequisites || []);
      const learningObjectives = typeof t.learning_objectives === 'string' ? JSON.parse(t.learning_objectives || '[]') : (t.learning_objectives || []);
      const referenceUrls = typeof t.reference_urls === 'string' ? JSON.parse(t.reference_urls || '[]') : (t.reference_urls || []);
      const subtopics = typeof t.subtopics_json === 'string' ? JSON.parse(t.subtopics_json || '[]') : (t.subtopics_json || []);

      let nodeStatus = 'available';
      if (studentId) {
        if (progressMap[t.id] === 'completed') {
          nodeStatus = 'completed';
        } else if (progressMap[t.id] === 'in_progress') {
          nodeStatus = 'in_progress';
        } else if (prerequisites.length > 0 && !prerequisites.every((pId) => progressMap[pId] === 'completed')) {
          nodeStatus = 'locked';
        }
      }

      return {
        ...t,
        prerequisites,
        learning_objectives: learningObjectives,
        reference_urls: referenceUrls,
        subtopics,
        nodeStatus,
      };
    });

    // Group topics by module
    const modules = modulesRaw.map((m) => {
      const moduleTopics = topics.filter((t) => t.module_id === m.id);
      const modCompleted = moduleTopics.filter((t) => t.nodeStatus === 'completed').length;
      return {
        ...m,
        topics: moduleTopics,
        topicsCount: moduleTopics.length,
        completedCount: modCompleted,
        progressPercentage: moduleTopics.length > 0 ? Math.round((modCompleted / moduleTopics.length) * 100) : 0,
      };
    });

    const isEnrolled = studentId ? Boolean(roadmapRepository.getUserEnrollment(studentId, roadmap.id)) : false;
    const completedCount = Object.values(progressMap).filter((s) => s === 'completed').length;
    const totalCount = topics.length;

    return {
      ...roadmap,
      tags: typeof roadmap.tags === 'string' ? JSON.parse(roadmap.tags || '[]') : (roadmap.tags || []),
      skills_covered: typeof roadmap.skills_covered === 'string' ? JSON.parse(roadmap.skills_covered || '[]') : (roadmap.skills_covered || []),
      prerequisites_list: typeof roadmap.prerequisites_list === 'string' ? JSON.parse(roadmap.prerequisites_list || '[]') : (roadmap.prerequisites_list || []),
      related_roadmap_ids: typeof roadmap.related_roadmap_ids === 'string' ? JSON.parse(roadmap.related_roadmap_ids || '[]') : (roadmap.related_roadmap_ids || []),
      isEnrolled,
      progressPercentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      completedTopicsCount: completedCount,
      totalTopicsCount: totalCount,
      userProgress: progressMap,
      modules,
      topics,
    };
  }

  async getTopicDetails(topicId, studentId = null) {
    const topic = roadmapRepository.findTopicById(topicId);
    if (!topic) {
      throw new NotFoundError(`Topic not found: ${topicId}`);
    }

    const neighbors = roadmapRepository.getTopicNeighbors(topic.roadmap_id, topic.display_order);

    const learningObjectives = typeof topic.learning_objectives === 'string'
      ? JSON.parse(topic.learning_objectives || '[]')
      : (topic.learning_objectives || []);
    const prerequisites = typeof topic.prerequisites === 'string'
      ? JSON.parse(topic.prerequisites || '[]')
      : (topic.prerequisites || []);
    const subtopics = typeof topic.subtopics_json === 'string'
      ? JSON.parse(topic.subtopics_json || '[]')
      : (topic.subtopics_json || []);
    const referenceUrls = typeof topic.reference_urls === 'string'
      ? JSON.parse(topic.reference_urls || '[]')
      : (topic.reference_urls || []);

    let userProgress = {
      is_completed: 0,
      status: 'available',
      completed_at: null,
      updated_at: null,
    };

    if (studentId) {
      const progress = roadmapRepository.getUserTopicProgressSingle(studentId, topicId);
      if (progress) {
        userProgress = {
          is_completed: progress.is_completed || (progress.status === 'completed' ? 1 : 0),
          status: progress.status || (progress.is_completed ? 'completed' : 'in_progress'),
          completed_at: progress.completed_at,
          updated_at: progress.updated_at,
        };
      }

      // Automatically log topic view in learning activity
      roadmapRepository.logLearningActivity(
        studentId,
        'topic_viewed',
        'topic',
        topicId,
        topic.title,
        { roadmap_id: topic.roadmap_id, roadmap_title: topic.roadmap_title }
      );
    }

    // Article Fallback resolution
    const hasVideo = Boolean(topic.video_id && topic.video_id.trim().length > 0);
    const hasArticle = Boolean(topic.article_url && topic.article_url.trim().length > 0);

    const resourceType = hasVideo ? 'video' : (hasArticle ? 'article' : 'none');
    const isUsingArticleFallback = !hasVideo && hasArticle;

    return {
      ...topic,
      learning_objectives: learningObjectives,
      prerequisites,
      subtopics,
      reference_urls: referenceUrls,
      previous_topic: neighbors.prev,
      next_topic: neighbors.next,
      user_progress: userProgress,
      resource_type: resourceType,
      is_using_article_fallback: isUsingArticleFallback,
    };
  }

  async enrollInRoadmap(studentId, roadmapId) {
    const roadmap = roadmapRepository.findByIdOrSlug(roadmapId);
    if (!roadmap) {
      throw new NotFoundError(`Roadmap not found: ${roadmapId}`);
    }
    return roadmapRepository.enroll(studentId, roadmap.id);
  }

  async updateTopicProgress(studentId, topicId, status) {
    const topic = roadmapRepository.findTopicById(topicId);
    if (!topic) {
      throw new NotFoundError(`Topic not found: ${topicId}`);
    }
    roadmapRepository.updateTopicProgress(studentId, topicId, status);
    return { success: true, topicId, status };
  }

  async updateVideoProgress(studentId, topicId) {
    const topic = roadmapRepository.findTopicById(topicId);
    if (!topic) {
      throw new NotFoundError(`Topic not found: ${topicId}`);
    }
    roadmapRepository.updateVideoProgress(studentId, topicId);
    return { success: true, topicId, videoWatched: true };
  }

  async getMyRoadmaps(studentId) {
    return roadmapRepository.getUserEnrolledRoadmaps(studentId);
  }

  async getStudentDashboard(studentId) {
    return roadmapRepository.getStudentDashboardData(studentId);
  }

  async searchGlobal(query, filters = {}) {
    if (!query || query.trim().length === 0) {
      return { query: '', results: { roadmaps: [], topics: [], totalMatches: 0 } };
    }
    return roadmapRepository.searchGlobal(query.trim(), filters);
  }

  // --- ADMIN CONTENT MANAGEMENT ---
  async adminListRoadmaps() {
    return roadmapRepository.findAll();
  }

  async adminCreateRoadmap(data) {
    if (!data.title || !data.category) {
      throw new BadRequestError('Title and category are required.');
    }
    return roadmapRepository.createRoadmap(data);
  }

  async adminUpdateRoadmap(id, data) {
    const existing = roadmapRepository.findByIdOrSlug(id);
    if (!existing) throw new NotFoundError(`Roadmap not found: ${id}`);
    return roadmapRepository.updateRoadmap(existing.id, data);
  }

  async adminDeleteRoadmap(id) {
    const existing = roadmapRepository.findByIdOrSlug(id);
    if (!existing) throw new NotFoundError(`Roadmap not found: ${id}`);
    return roadmapRepository.deleteRoadmap(existing.id);
  }

  async adminCreateModule(roadmapId, data) {
    if (!data.title) throw new BadRequestError('Module title is required.');
    return roadmapRepository.createModule(roadmapId, data);
  }

  async adminUpdateModule(id, data) {
    return roadmapRepository.updateModule(id, data);
  }

  async adminDeleteModule(id) {
    return roadmapRepository.deleteModule(id);
  }

  async adminCreateTopic(roadmapId, data) {
    if (!data.title) throw new BadRequestError('Topic title is required.');
    return roadmapRepository.createTopic(roadmapId, data);
  }

  async adminUpdateTopic(id, data) {
    return roadmapRepository.updateTopic(id, data);
  }

  async adminDeleteTopic(id) {
    return roadmapRepository.deleteTopic(id);
  }

  async adminGetMissingResources() {
    return roadmapRepository.getTopicsMissingResources();
  }
}

export const roadmapService = new RoadmapService();
