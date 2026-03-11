import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X, TriangleAlert, Info } from 'lucide-react-native';
import { useTheme } from './ThemeContext';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  anim: Animated.Value;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

function ToastItem({ toast, theme }: { toast: Toast; theme: any }) {
  const typeConfig = {
    success: { color: theme.green, Icon: Check },
    error:   { color: theme.red,   Icon: X },
    warning: { color: theme.amber, Icon: TriangleAlert },
    info:    { color: theme.acc,   Icon: Info },
  };
  const { color, Icon } = typeConfig[toast.type];

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: theme.card,
          borderColor: color + '40',
          borderTopColor: color,
          shadowColor: '#000',
          transform: [
            {
              translateY: toast.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-72, 0],
              }),
            },
            {
              scale: toast.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            },
          ],
          opacity: toast.anim,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
        <Icon size={16} color={color} />
      </View>
      <Text style={[styles.msg, { color: theme.text, fontFamily: 'Sora_600SemiBold' }]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = idRef.current++;
    const anim = new Animated.Value(0);

    setToasts((prev) => [...prev.slice(-2), { id, type, message, anim }]);

    // Animate in
    Animated.spring(anim, {
      toValue: 1,
      damping: 16,
      stiffness: 200,
      useNativeDriver: true,
    }).start();

    // Auto dismiss after 3s
    setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      });
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        style={[
          styles.container,
          { top: insets.top + 8, zIndex: 9999 },
        ]}
        pointerEvents="none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} theme={theme} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderTopWidth: 3,
    padding: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 8,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  msg: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
});
