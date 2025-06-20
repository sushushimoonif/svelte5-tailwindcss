import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// 模拟数据库数据
const mockPageData = {
  1: {
    id: 1,
    title: "自然风光摄影",
    description: "探索大自然的壮丽与神秘，从雄伟的山峦到宁静的湖泊，感受自然界的无限魅力。",
    content: "自然风光摄影是一门捕捉大自然原始美景的艺术形式。从巍峨的山峦到宁静的湖泊，从茂密的森林到广袤的草原，每一个自然景观都有其独特的魅力和故事。优秀的风光摄影师不仅需要具备扎实的技术功底，更需要对自然环境有深刻的理解和敏锐的观察力。\n\n在拍摄自然风光时，光线是最重要的因素之一。黄金时段的柔和光线能够为景物增添温暖的色调，而蓝调时刻则能营造出神秘而宁静的氛围。摄影师需要耐心等待最佳的光线条件，有时甚至需要多次前往同一地点才能捕捉到理想的画面。",
    image_urls: [
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      "https://images.pexels.com/photos/1006293/pexels-photo-1006293.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      "https://images.pexels.com/photos/1408221/pexels-photo-1408221.jpeg?auto=compress&cs=tinysrgb&w=400&h=600"
    ],
    comments: [
      {
        id: 101,
        content: "晨雾中的山峦展现出层次分明的轮廓，营造出中国山水画般的意境"
      },
      {
        id: 102,
        content: "湖面如镜，倒映着天空的云彩，形成完美的对称构图"
      },
      {
        id: 103,
        content: "古老的森林中，阳光透过树叶洒下斑驳的光影"
      },
      {
        id: 104,
        content: "沙漠中的日落时分，金色的沙丘呈现出丰富的层次"
      }
    ]
  },
  2: {
    id: 2,
    title: "城市建筑摄影",
    description: "记录人类文明发展轨迹，从古典历史建筑到现代摩天大楼的建筑美学。",
    content: "城市建筑摄影是记录人类文明发展轨迹的重要方式。从古典的历史建筑到现代的摩天大楼，每一座建筑都承载着特定时代的文化内涵和技术成就。建筑摄影师需要具备对建筑美学的深刻理解，通过摄影语言来表达建筑的精神内核。\n\n在城市建筑摄影中，构图和透视是关键要素。摄影师需要选择合适的拍摄角度来展现建筑的宏伟气势或精致细节。同时，光影的运用也至关重要，不同时间的光线会为建筑带来截然不同的视觉效果。",
    image_urls: [
      "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      "https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      "https://images.pexels.com/photos/1462935/pexels-photo-1462935.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      "https://images.pexels.com/photos/1820770/pexels-photo-1820770.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      "https://images.pexels.com/photos/2356059/pexels-photo-2356059.jpeg?auto=compress&cs=tinysrgb&w=400&h=600"
    ],
    comments: [
      {
        id: 201,
        content: "现代摩天大楼的玻璃幕墙在阳光照射下闪闪发光"
      },
      {
        id: 202,
        content: "古典建筑的石雕装饰展现了工匠们精湛的技艺"
      },
      {
        id: 203,
        content: "城市桥梁的钢铁结构在夜晚灯光映衬下格外壮观"
      },
      {
        id: 204,
        content: "建筑的几何图案创造出强烈的视觉节奏感"
      }
    ]
  }
};

// 为其他页面生成数据
function generatePageData(id: number) {
  if (mockPageData[id as keyof typeof mockPageData]) {
    return mockPageData[id as keyof typeof mockPageData];
  }
  
  // 生成其他页面的数据
  const titles = [
    "人物肖像摄影", "抽象艺术摄影", "野生动物摄影", 
    "街头摄影", "微距摄影", "黑白摄影", "夜景摄影", "运动摄影"
  ];
  
  const basePhotos = [
    "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
    "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
    "https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
    "https://images.pexels.com/photos/1462935/pexels-photo-1462935.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
    "https://images.pexels.com/photos/1820770/pexels-photo-1820770.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
    "https://images.pexels.com/photos/2356059/pexels-photo-2356059.jpeg?auto=compress&cs=tinysrgb&w=400&h=600"
  ];
  
  const titleIndex = (id - 3) % titles.length;
  const title = titles[titleIndex];
  
  return {
    id,
    title,
    description: `探索${title}的艺术魅力，发现摄影的无限可能性。`,
    content: `${title}是摄影艺术中的重要分支，它要求摄影师具备独特的视角和专业的技术能力。通过精心的构图和光线运用，摄影师能够创造出令人印象深刻的视觉作品。\n\n在${title}的创作过程中，摄影师需要深入理解拍摄对象的特点，选择合适的拍摄时机和角度。每一张成功的作品都凝聚了摄影师的创意思维和技术功底。`,
    image_urls: basePhotos,
    comments: [
      {
        id: id * 100 + 1,
        content: `${title}需要摄影师具备敏锐的观察力和耐心`
      },
      {
        id: id * 100 + 2,
        content: `光线和构图在${title}中起着至关重要的作用`
      },
      {
        id: id * 100 + 3,
        content: `每一张${title}作品都讲述着独特的故事`
      },
      {
        id: id * 100 + 4,
        content: `${title}展现了摄影艺术的多样性和创造力`
      }
    ]
  };
}

export const GET: RequestHandler = async ({ params }) => {
  try {
    const pageId = parseInt(params.id);
    
    if (isNaN(pageId) || pageId < 1 || pageId > 10) {
      return json({ error: 'Invalid page ID' }, { status: 400 });
    }
    
    const pageData = generatePageData(pageId);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
    
    return json(pageData);
    
  } catch (error) {
    console.error('API Error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};