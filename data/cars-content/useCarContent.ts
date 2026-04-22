'use client';

import { useEffect, useState } from 'react';

import {
  getCarContentMap,
  normalizeCarContentLocale,
} from './index';
import type { CarContentMap } from './types';

export function useCarContentMap(locale?: string) {
  const [contentMap, setContentMap] =
    useState<CarContentMap>({});

  useEffect(() => {
    let isMounted = true;

    getCarContentMap(normalizeCarContentLocale(locale)).then(
      (nextMap) => {
        if (isMounted) {
          setContentMap(nextMap);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return contentMap;
}
