import type { Portal } from './layout.types';

export const defaultThemes: Portal = [{
  name: 'Dark',
  active: true,
  basics: {
    colors: {
      primary: '222,0,80',
      primaryContrast: '255,255,255',
      secondary: '239,102,152',
      background: '27, 26, 21',
      text: '255,255,255',
      textContrast: '0,0,0',
      border: '155,155,155',
    }
  },
  header: {
    colors: {
      background: '0,0,0',
      border: 'border',
      shadow: 'rgba(0, 0, 0, 0.4)',
    },
    preferences: {
      opacity: 0.4,
      gradient: true,
      shadow: '0 4px 10px',
    }
  },
  navigation: {
    colors: {
      background: '0,0,0',
      border: 'border',
      text: 'text',
      hover: 'primary',
    },
    preferences: {
      opacity: 1,
      shadow: '0 2px 2px',
    }
  },
  footer: {
    colors: {
      background: '0,0,0',
    },
    preferences: {
      opacity: 1,
    }
  },
  content: {
    colors: {
      background: '0,0,0',
    },
    preferences: {
      opacity: 1,
    }
  },
  posts: {
    colors: {
      background: '0,0,0'
    },
    preferences: {
      opacity: 0.6,
    }
  },
  buttons: {
    default: {
      default: {
        colors: {
          color: '255,255,255',
          background: '33,33,33',
          border: '33,33,33',
        },
        preferences: {
          opacity: 1,
        }
        
      },
      hover: {
        colors: {
          color: '255,255,255',
          background: '50,50,50',
          border: '50,50,50',
        },
        preferences: {
          opacity: 1,
        }
      }
    },
    primary: {
      default: {
        colors: {
          color: '255,255,255',
          background: 'primary',
          border: 'primary',
        },
        preferences: {
          opacity: 1,
        }
      },
      hover: {
        colors: {
          color: '255,255,255',
          background: 'primary',
          border: 'primary',
        },
        preferences: {
          opacity: 1,
        }
      }      
    }
  }
},
{
  name: 'Light',
  active: false,
  basics: {
    colors: {
      primary: '222,0,80',
      primaryContrast: '255,255,255',
      secondary: '239,102,152',
      background: '235, 235, 235',
      text: '0,0,0',
      textContrast: '255,255,255',
    }
  },
  header: {
    colors: {
      background: '255,255,255',
      border: 'border',
      shadow: 'rgba(0, 0, 0, 0.4)',
    },
    preferences: {
      opacity: 1,
      shadow: '0 4px 10px',
    }
  },
  navigation: {
    colors: {
      background: '0,0,0',
      text: '255,255,255',
      border: 'border',
      hover: 'primary',      
    },
    preferences: {
      opacity: 1,
    }
  },
  footer: {
    colors: {

    }
  },
  content: {
    colors: {
      background: '255,255,255',
    },
    preferences: {
      opacity: 1,
    }
  },
  posts: {
    colors: {
      background: '255,255,255'
    },
    preferences: {
      opacity: 1,
    }
  },
  buttons: {
    default: {
      default: {
        colors: {
          color: '255,255,255',
          background: '0,0,0',
          border: '0,0,0',
        },
        preferences: {
          opacity: 1,
        }        
      },
      hover: {
        colors: {
          color: '255,255,255',
          background: '50,50,50',
          border: '0,0,0',
        },
        preferences: {
          opacity: 1,
        }      
      }
    },
    primary: {
      default: {
        colors: {
          color: '255,255,255',
          background: 'primary',
          border: 'primary',
        },
        preferences: {
          opacity: 1,
        }         
      },
      hover: {
        colors: {
          color: '255,255,255',
          background: 'primary',
          border: 'primary',
        },
        preferences: {
          opacity: 1,
        } 
      }      
    }
  }
}]