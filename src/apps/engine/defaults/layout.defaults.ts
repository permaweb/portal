import type { PortalLayout } from './layout.types';

export const defaultLayout: PortalLayout = {
  basics: {
    gradient: true,
    wallpaper: '',
    borderRadius: 0,
    maxWidth: 1600,
  },
  header: {
    layout: {
      width: "page",
      height: "100px",
      padding: "0 20px",
      border: {
        top: false,
        sides: false,
        bottom: true
      } 
    },
    content: {
      "logo": {
      "display": true,
      "positionX": "left",
      "positionY": "bottom",
      "txId": "S7ak-MxJkV_iuaiXrz2cZ1TsyfSToQnlix4HXdreZpY",
      "size": "80%"
    },
    "links": [
      {
        "title": "X",
        "icon": "x",
        "uri": "https://x.com/permawebjournal"
      },
    ]
    },
  },
  navigation: {
    layout: {
      width: "page",
      height: 50,
      padding: "0 20px",
      gradient: false,
      shadow: true,
      border: {
        top: false,
        sides: false,
        bottom: true
      },
      opacity: 1
    },
    content: {},
  },
  content: {
    layout: {
      width: "page",
      padding: "0 20px",
    }
  },
  footer: {
    layout: {
      width: "page",
      height: "230px",
      padding: "14px",
      verticalAlign: "center",
      border: {
        top: true,
        sides: false,
        bottom: false
      },
      fixed: false,  
    },
    content: {
      type: "grid",
      content: [
        {
          type: "row",
          layout: {
            width: 1,
            margin: "0",
          },
          content: [
            {
              type: "link",
              text: "Arweave",
              uri: "feed/category/1752687205671",
            },
            {
              type: "link",
              text: "AO",
              uri: "feed/category/1752687208638",
            },
            {
              type: "link",
              text: "Newsletter",
              uri: "feed/category/1752687217653",
            }
          ]
        },
        {
          type: "row",
          layout: {
            width: 1,
            margin: "0",
          },
          content: [
            {
              type: "link",
              text: "About",
              uri: "feed/category/1752687205671",
            },
          ]
        }
      ]
    }
  },
  card: {
    flow: "row",
    comments: false,
    layout: "journal"
  },
  comments: {}
};