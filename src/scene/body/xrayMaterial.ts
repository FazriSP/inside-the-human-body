import {
  Color,
  DoubleSide,
  FrontSide,
  MeshStandardMaterial,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import type { LayerId } from '@/content/schema/anatomy.schema';

export interface XrayUniforms {
  uXrayMix: { value: number };
  uRimColor: { value: Color };
}

export interface AnatomicalMeshMaterial extends MeshStandardMaterial {
  userData: {
    baseColor: Color;
    rimColor: Color;
    xrayUniforms?: XrayUniforms;
  };
}

function resolveBasePalette(
  layerId: LayerId,
  nodeName: string,
): { baseHex: string; rimHex: string; roughness: number; metalness: number } {
  const cleanName = nodeName.replace(/_/g, ' ');

  if (layerId === 'rangka') {
    const isCartilage = /cartilage|disc/i.test(cleanName);
    return {
      baseHex: isCartilage ? '#cbd5e1' : '#e8dfd1',
      rimHex: '#fef3c7',
      roughness: isCartilage ? 0.36 : 0.48,
      metalness: 0.04,
    };
  }

  if (layerId === 'peredaran-darah') {
    const isValve = /valve|leaflet/i.test(cleanName);
    if (isValve) {
      return {
        baseHex: '#e2e8f0',
        rimHex: '#f8fafc',
        roughness: 0.35,
        metalness: 0.08,
      };
    }

    const isChamber = /atrium|ventricle|papillary/i.test(cleanName);
    if (isChamber) {
      const isLeftChamber = /left/i.test(cleanName);
      return isLeftChamber
        ? {
            baseHex: '#b91c1c',
            rimHex: '#ef4444',
            roughness: 0.42,
            metalness: 0.06,
          }
        : {
            baseHex: '#9f1239',
            rimHex: '#f43f5e',
            roughness: 0.44,
            metalness: 0.06,
          };
    }

    const isVenous =
      /vein|vena|jugular|saphenous|azygos|sinus|pulmonary trunk|pulmonary artery/i.test(
        cleanName,
      );
    return {
      baseHex: isVenous ? '#1d4ed8' : '#dc2626',
      rimHex: isVenous ? '#60a5fa' : '#f87171',
      roughness: isVenous ? 0.36 : 0.34,
      metalness: 0.08,
    };
  }

  if (layerId === 'pernapasan') {
    const isAirway = /trachea|bronchus|epiglottis|larynx|cartilage/i.test(
      cleanName,
    );
    return isAirway
      ? {
          baseHex: '#d6d3c4',
          rimHex: '#f5f5f4',
          roughness: 0.38,
          metalness: 0.05,
        }
      : {
          baseHex: '#e17076',
          rimHex: '#fda4af',
          roughness: 0.46,
          metalness: 0.04,
        };
  }

  // 'kulit' (body regions outer surface)
  return {
    baseHex: '#5eead4',
    rimHex: '#2dd4bf',
    roughness: 0.38,
    metalness: 0.04,
  };
}

/**
 * Creates a MeshStandardMaterial augmented with a view-dependent Fresnel X-ray rim shader
 * so switching to X-ray mode produces clean holographic silhouettes without sorting glitches.
 */
export function createAnatomicalMaterial(
  layerId: LayerId,
  nodeName: string,
): AnatomicalMeshMaterial {
  const palette = resolveBasePalette(layerId, nodeName);
  const baseColor = new Color(palette.baseHex);
  const rimColor = new Color(palette.rimHex);

  const mat = new MeshStandardMaterial({
    color: baseColor.clone(),
    roughness: palette.roughness,
    metalness: palette.metalness,
    side:
      layerId === 'kulit' || layerId === 'peredaran-darah'
        ? DoubleSide
        : FrontSide,
  }) as AnatomicalMeshMaterial;

  const xrayUniforms: XrayUniforms = {
    uXrayMix: { value: 0 },
    uRimColor: { value: rimColor.clone() },
  };

  mat.userData = {
    baseColor,
    rimColor,
    xrayUniforms,
  };

  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uXrayMix = xrayUniforms.uXrayMix;
    shader.uniforms.uRimColor = xrayUniforms.uRimColor;

    shader.fragmentShader =
      `
      uniform float uXrayMix;
      uniform vec3 uRimColor;
      ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      if (uXrayMix > 0.01) {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - clamp(abs(dot(normal, viewDir)), 0.0, 1.0), 2.1);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uRimColor, fresnel * 0.85 * uXrayMix);
        gl_FragColor.a = mix(gl_FragColor.a, clamp(0.12 + fresnel * 0.72, 0.12, 0.88), uXrayMix);
      }
      #include <dithering_fragment>
      `,
    );
  };

  return mat;
}
