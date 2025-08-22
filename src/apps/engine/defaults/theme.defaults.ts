import type { Portal } from './layout.types';

export const defaultThemes: Portal = [
  {
    "name": "Default",
    "active": true,    
    "basics": {
      "colors": {
        "text": {
          "light": "0,0,0",
          "dark": "255,255,255"
        },
        "background": {
          "light": "250,250,250",
          "dark": "20,20,20"
        },
        "primary": {
          "light": "151,151,151",
          "dark": "77,77,77"
        },
        "secondary": {
          "light": "69,153,232",
          "dark": "69,153,232"
        },
        "border": {
          "light": "50, 50, 50",
          "dark": "208, 208, 208"
        }
      },
      "preferences": {
        "borderRadius": 0,
        "wallpaper": undefined
      }
    },
    "header": {
      "colors": {
        "background": {
          "light": "background",
          "dark": "background"
        },
        "border": {
          "light": "border",
          "dark": "border"
        },
        "shadow": {
          "light": "rgba(0, 0, 0, 0.4)",
          "dark": "rgba(0, 0, 0, 0.4)"
        }
      },
      "preferences": {
        "opacity": {
          "light": 1,
          "dark": 0.4
        },
        "shadow": {
          "light": "0 4px 10px",
          "dark": "0 4px 10px"
        },
        "gradient": {
          "light": true,
          "dark": true
        }
      }
    },
    "navigation": {
      "colors": {
        "background": {
          "light": "238, 238, 238",
          "dark": "32, 32, 32"
        },
        "text": {
          "light": "text",
          "dark": "text"
        },
        "border": {
          "light": "border",
          "dark": "border"
        },
        "hover": {
          "light": "50,50,50",
          "dark": "208,208,208"
        }
      },
      "preferences": {
        "opacity": {
          "light": 1,
          "dark": 1
        },
        "shadow": {
          "light": "unset",
          "dark": "0 2px 2px"
        }
      }
    },
    "content": {
      "colors": {
        "background": {
          "light": "255,255,255",
          "dark": "0,0,0"
        }
      },
      "preferences": {
        "opacity": {
          "light": 1,
          "dark": 1
        }
      }
    },
    "footer": {
      "colors": {
        "background": {
          "light": "background",
          "dark": "background"
        }
      },
      "preferences": {
        "opacity": {
          "light": 1,
          "dark": 1
        }
      }      
    },
    "card": {
      "colors": {
        "background": {
          "light": undefined,
          "dark": undefined
        },
        "border": {
          "light": "border",
          "dark": "border"
        }
      },
      "preferences": {
        "opacity": {
          "light": 1,
          "dark": 0.6
        }
      }
    },
    "buttons": {
      "default": {
        "default": {
          "colors": {
            "color": {
              "light": "255,255,255",
              "dark": "255,255,255"
            },
            "background": {
              "light": "0,0,0",
              "dark": "33,33,33"
            },
            "border": {
              "light": "0,0,0",
              "dark": "33,33,33"
            }
          },
          "preferences": {
            "opacity": {
              "light": 1,
              "dark": 1
            }
          }
        },
        "hover": {
          "colors": {
            "color": {
              "light": "255,255,255",
              "dark": "255,255,255"
            },
            "background": {
              "light": "50,50,50",
              "dark": "50,50,50"
            },
            "border": {
              "light": "0,0,0",
              "dark": "50,50,50"
            }
          },
          "preferences": {
            "opacity": {
              "light": 1,
              "dark": 1
            }
          }
        }
      },
      "primary": {
        "default": {
          "colors": {
            "color": {
              "light": "255,255,255",
              "dark": "255,255,255"
            },
            "background": {
              "light": "primary",
              "dark": "primary"
            },
            "border": {
              "light": "primary",
              "dark": "primary"
            }
          },
          "preferences": {
            "opacity": {
              "light": 1,
              "dark": 1
            }
          }
        },
        "hover": {
          "colors": {
            "color": {
              "light": "255,255,255",
              "dark": "255,255,255"
            },
            "background": {
              "light": "primary",
              "dark": "primary"
            },
            "border": {
              "light": "primary",
              "dark": "primary"
            }
          },
          "preferences": {
            "opacity": {
              "light": 1,
              "dark": 1
            }
          }
        }
      }
    }
  }
]