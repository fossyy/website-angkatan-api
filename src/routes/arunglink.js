import { Router } from 'express';      
import { getAllLinks, getLinkBySlug, getLinksByCategory } from '../lib/arunglink.js';

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

router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const data = await getLinksByCategory(category);
    
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching arunglink by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch arunglink data'
    });
  }
});

export default router;