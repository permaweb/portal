import type { PortalLayout } from './layout.types';

export const defaultLayout: PortalLayout = {
  basics: {
    gradient: true,
    wallpaper: '',
    borderRadius: 0 
  },
  header: {
    layout: {
      width: "page",
      height: "120px",
      padding: "0",
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
        "title": "Odysee",
        "icon": "odysee",
        "uri": ""
      },
      {
        "title": "Telegram",
        "icon": "telegram",
        "uri": ""
      },
      {
        "title": "Mastodon",
        "icon": "mastodon",
        "uri": ""
      },
      {
        "title": "VK",
        "icon": "vk",
        "uri": ""
      },
      {
        "title": "X",
        "icon": "x",
        "uri": ""
      },
      {
        "title": "LinkedIn",
        "icon": "linkedin",
        "uri": ""
      },
      {
        "title": "Patreon",
        "icon": "patreon",
        "uri": ""
      },
      {
        "title": "RSS Feed",
        "icon": "rss",
        "uri": ""
      },
      {
        "title": "Facebook",
        "icon": "facebook",
        "uri": ""
      },
      {
        "title": "Dailymotion",
        "icon": "dailymotion",
        "uri": ""
      },
      {
        "title": "Rumble",
        "icon": "rumble",
        "uri": ""
      },
      {
        "title": "YouTube",
        "icon": "youtube",
        "uri": ""
      },
      {
        "title": "GitHub",
        "icon": "github",
        "uri": ""
      },
      {
        "title": "Discord",
        "icon": "discord",
        "uri": ""
      },
      {
        "title": "WhatsApp",
        "icon": "whatsapp",
        "uri": ""
      },
      {
        "title": "Reddit",
        "icon": "reddit",
        "uri": ""
      },
      {
        "title": "Instagram",
        "icon": "instagram",
        "uri": ""
      },
      {
        "title": "TikTok",
        "icon": "tiktok",
        "uri": ""
      },
      {
        "title": "WeChat",
        "icon": "wechat",
        "uri": ""
      },
      {
        "title": "Apple Podcasts",
        "icon": "apple",
        "uri": ""
      },
      {
        "title": "Spotify",
        "icon": "spotify",
        "uri": ""
      }
    ]
    },
  },
  navigation: {
    layout: {
      width: "page",
      height: "40px",
      padding: "0",
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
  footer: {
    layout: {
      width: "page",
      height: "46px",
      padding: "14px",
      verticalAlign: "center",
      border: {
        top: false,
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
              text: "Contact",
              uri: "abc",
            },
            {
              type: "label",
              text: "|",
            },
            {
              type: "link",
              text: "Impressum",
              uri: "abc",
            }
          ]
        }
      ]
    }
  },
  card: {
    flow: "column",
  },
  comments: {}
};