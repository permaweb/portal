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
          "light": "235, 235, 235",
          "dark": "27, 26, 21"
        },
        "primary": {
          "light": "80,154,176",
          "dark": "80,154,176"
        },
        "secondary": {
          "light": "51,105,125",
          "dark": "51,105,125"
        },
        "border": {
          "light": "155,155,155",
          "dark": "155,155,155"
        }
      },
      "preferences": {
        "borderRadius": 0,
        "wallpaper": "BBbg_l-3_Z6UPH_9PG-Ad2ntHLwe9HhdMdEsbk8r_DU"
      }
    },
    "header": {
      "colors": {
        "background": {
          "light": "255,255,255",
          "dark": "0,0,0"
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
          "light": "0,0,0",
          "dark": "0,0,0"
        },
        "text": {
          "light": "255,255,255",
          "dark": "text"
        },
        "border": {
          "light": "border",
          "dark": "border"
        },
        "hover": {
          "light": "primary",
          "dark": "primary"
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
          "light": "0,0,0",
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
    "card": {
      "colors": {
        "background": {
          "light": "255,255,255",
          "dark": "0,0,0"
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