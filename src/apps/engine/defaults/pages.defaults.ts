import type { PortalLayout } from './layout.types';

export const defaultPages = {
  home: {
    type: "grid",
    content: [
      {
        type: "row",
        width: 1,
        content: [
          {
            type: "postSpotlight",
            txId: "zEST8VQpxCLZMPWcj1bK2MSDw6CLjOeSaXnGODapvdo"
          }
        ]
      },{
        type: "row",
        width: 1,
        content: [{
          type: "categorySpotlight",
          category: "Category A"
        }],
        layout: {
          width: "page",
          padding: "0 0",
          background: "0,0,0"
        }
      }
    ]
  },
  feed: {
    type: 'grid', 
    content: [{
      type: 'row', 
      width: 'page', 
      content: [
        { 
          type: 'feed',
          width: 3
        },{
          type: 'sidebar',
          width: 1,
          content: ["date", "authors", "sources", "podcasts"]
        }
      ]
    }]    
  },
  user: {
    type: 'grid', 
    content: [{
      type: 'row',
      width: 3,
      content: [{
        type: 'sidebar',
        width: 1,
        content: ['user']
      },{          
        type: 'feed',
        width: 3
      }]
    }]
  },
  post: {
    type: 'grid', 
    content: [{
      type: 'row', 
      width: 'page', 
      content: [{ 
        type: 'post',
      }]
    }] 
  },
};