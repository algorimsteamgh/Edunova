import { roadmapService } from './service.js';

export const roadmapController = {
  list: async (req, res, next) => {
    try {
      const { category, level, search, technology } = req.query;
      const roadmaps = await roadmapService.listRoadmaps({ category, level, search, technology });
      res.status(200).json({
        status: 'success',
        data: roadmaps,
        roadmaps,
      });
    } catch (err) {
      next(err);
    }
  },

  getByIdOrSlug: async (req, res, next) => {
    try {
      const studentId = req.user?.id || null;
      const roadmap = await roadmapService.getRoadmapDetails(req.params.idOrSlug, studentId);
      res.status(200).json({
        status: 'success',
        data: {
          roadmap,
          modules: roadmap.modules || [],
          topics: roadmap.topics || [],
          isEnrolled: roadmap.isEnrolled || false,
          userProgress: roadmap.userProgress || {},
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getTopicDetails: async (req, res, next) => {
    try {
      const studentId = req.user?.id || null;
      const topicId = req.params.topicId;
      const topicData = await roadmapService.getTopicDetails(topicId, studentId);
      res.status(200).json({
        status: 'success',
        data: topicData,
      });
    } catch (err) {
      next(err);
    }
  },

  enroll: async (req, res, next) => {
    try {
      const studentId = req.user.id;
      const enrollment = await roadmapService.enrollInRoadmap(studentId, req.params.id);
      res.status(201).json({
        status: 'success',
        message: 'Successfully enrolled in roadmap',
        data: { enrollment },
      });
    } catch (err) {
      next(err);
    }
  },

  updateTopicProgress: async (req, res, next) => {
    try {
      const studentId = req.user.id;
      const { topicId } = req.params;
      const { status } = req.body;
      const result = await roadmapService.updateTopicProgress(studentId, topicId, status || 'completed');
      res.status(200).json({
        status: 'success',
        message: 'Topic progress updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  updateVideoProgress: async (req, res, next) => {
    try {
      const studentId = req.user.id;
      const { topicId } = req.params;
      const result = await roadmapService.updateVideoProgress(studentId, topicId);
      res.status(200).json({
        status: 'success',
        message: 'Video progress recorded successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  getMyRoadmaps: async (req, res, next) => {
    try {
      const studentId = req.user.id;
      const roadmaps = await roadmapService.getMyRoadmaps(studentId);
      res.status(200).json({
        status: 'success',
        data: roadmaps,
        roadmaps,
      });
    } catch (err) {
      next(err);
    }
  },

  getStudentDashboard: async (req, res, next) => {
    try {
      const studentId = req.user.id;
      const dashboard = await roadmapService.getStudentDashboard(studentId);
      res.status(200).json({
        status: 'success',
        data: dashboard,
      });
    } catch (err) {
      next(err);
    }
  },

  searchGlobal: async (req, res, next) => {
    try {
      const { q, level, category } = req.query;
      const searchResults = await roadmapService.searchGlobal(q || '', { level, category });
      res.status(200).json({
        status: 'success',
        data: searchResults,
      });
    } catch (err) {
      next(err);
    }
  },

  // --- ADMIN CONTENT CONTROLLERS ---
  adminCreateRoadmap: async (req, res, next) => {
    try {
      const roadmap = await roadmapService.adminCreateRoadmap(req.body);
      res.status(201).json({ status: 'success', data: roadmap });
    } catch (err) {
      next(err);
    }
  },

  adminUpdateRoadmap: async (req, res, next) => {
    try {
      const roadmap = await roadmapService.adminUpdateRoadmap(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: roadmap });
    } catch (err) {
      next(err);
    }
  },

  adminDeleteRoadmap: async (req, res, next) => {
    try {
      const result = await roadmapService.adminDeleteRoadmap(req.params.id);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  adminCreateModule: async (req, res, next) => {
    try {
      const module = await roadmapService.adminCreateModule(req.params.roadmapId, req.body);
      res.status(201).json({ status: 'success', data: module });
    } catch (err) {
      next(err);
    }
  },

  adminUpdateModule: async (req, res, next) => {
    try {
      const module = await roadmapService.adminUpdateModule(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: module });
    } catch (err) {
      next(err);
    }
  },

  adminDeleteModule: async (req, res, next) => {
    try {
      const result = await roadmapService.adminDeleteModule(req.params.id);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  adminCreateTopic: async (req, res, next) => {
    try {
      const topic = await roadmapService.adminCreateTopic(req.params.roadmapId, req.body);
      res.status(201).json({ status: 'success', data: topic });
    } catch (err) {
      next(err);
    }
  },

  adminUpdateTopic: async (req, res, next) => {
    try {
      const topic = await roadmapService.adminUpdateTopic(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: topic });
    } catch (err) {
      next(err);
    }
  },

  adminDeleteTopic: async (req, res, next) => {
    try {
      const result = await roadmapService.adminDeleteTopic(req.params.id);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  adminGetMissingResources: async (req, res, next) => {
    try {
      const missing = await roadmapService.adminGetMissingResources();
      res.status(200).json({ status: 'success', data: missing });
    } catch (err) {
      next(err);
    }
  },
};
