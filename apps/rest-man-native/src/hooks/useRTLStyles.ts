import { StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

type StyleObject = { [key: string]: any };

export const useRTLStyles = (styles: StyleObject) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  const rtlStyles = Object.entries(styles).reduce((acc, [key, value]) => {
    // Handle flexDirection
    if (value.flexDirection) {
      if (value.flexDirection === 'row') {
        value.flexDirection = isRTL ? 'row-reverse' : 'row';
      } else if (value.flexDirection === 'row-reverse') {
        value.flexDirection = isRTL ? 'row' : 'row-reverse';
      }
    }

    // Handle textAlign
    if (value.textAlign) {
      if (value.textAlign === 'left') {
        value.textAlign = isRTL ? 'right' : 'left';
      } else if (value.textAlign === 'right') {
        value.textAlign = isRTL ? 'left' : 'right';
      }
    }

    // Handle padding and margin
    const rtlProperties = ['paddingLeft', 'paddingRight', 'marginLeft', 'marginRight'];
    rtlProperties.forEach(prop => {
      if (value[prop] !== undefined) {
        const oppositeProp = prop.replace(/(Left|Right)/, isRTL ? 
          (prop.includes('Left') ? 'Right' : 'Left') : 
          (prop.includes('Left') ? 'Left' : 'Right')
        );
        value[oppositeProp] = value[prop];
        delete value[prop];
      }
    });

    acc[key] = value;
    return acc;
  }, {} as StyleObject);

  return StyleSheet.create(rtlStyles);
}; 