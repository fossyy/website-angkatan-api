import { Router } from 'express';      
import { getAllLinks, getLinkBySlug, getFilteredLinks} from '../lib/arunglink.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = await getAllLinks();

    res.status(200).json({
      success: true,
      data: data  
    });
  } catch (error) {
    console.error('Error fetching arunglink:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch arunglink data'
    });
  }
});

router.get('/filter', async (req, res) => {
  try {
    const { category, from, to, search } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (from) filters.from = from;
    if (to) filters.to = to;
    if (search) filters.search = search;
    
    const data = await getFilteredLinks(filters);
    
    res.status(200).json({
      success: true,
      filters: filters,
      count: data.length, 
      data: data
    });
  } catch (error) {
    console.error('Error filtering arunglink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter arunglink data',
      error: error.message
    });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const data = await getLinkBySlug(slug);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Arunglink not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: data  
    });
  } catch (error) {
    console.error('Error fetching arunglink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch arunglink data'
    });
  }
});

export default router;