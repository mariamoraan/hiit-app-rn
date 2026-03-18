import { StepType } from '@/core/domain/routine';
import { COLORS } from '@/core/styles/colors';
import { FONTS } from '@/core/styles/fonts';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = 180;

enum PhaseColors {
    work = 'work',
    rest = 'rest',
    prep = 'prep'
}

const PHASE_COLORS: Record<PhaseColors, string> = {
  work: COLORS.work,
  rest: COLORS.rest,
  prep: COLORS.prep,
};

interface Props {
  secondsLeft: number;
  totalDur: number;
  type: StepType;
}

export default function RingTimer({ secondsLeft, totalDur, type }: Props) {
  const progress = useSharedValue(1);
  const color = PHASE_COLORS[type] || COLORS.work;

  useEffect(() => {
    const fraction = secondsLeft / totalDur;
    progress.value = withTiming(fraction, {
      duration: 900,
      easing: Easing.linear,
    });
  }, [secondsLeft, totalDur]);

  const animatedProps = useAnimatedProps(() => {
    const offset = CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset: offset,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={styles.svg}>
        {/* Background ring */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={COLORS.border}
          strokeWidth={7}
        />
        {/* Progress ring */}
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={[styles.countdown, { color }]}>{secondsLeft}</Text>
        <Text style={styles.label}>seg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
  },
  countdown: {
    fontFamily: FONTS.display,
    fontSize: 68,
    lineHeight: 68,
    letterSpacing: -1,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
