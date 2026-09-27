const fs = require("node:fs");
const path = require("node:path");

const outputPath = path.join(__dirname, "..", "assets", "low_poly_black_cat.glb");
const floatBytes = 4;
const component = {
    black: 0,
    charcoal: 1,
    yellow: 2,
    pupil: 3,
    ear: 4,
    nose: 5,
    whisker: 6
};

const materials = [
    { name: "Midnight Black", pbrMetallicRoughness: { baseColorFactor: [0.018, 0.024, 0.04, 1], metallicFactor: 0.08, roughnessFactor: 0.72 } },
    { name: "Soft Charcoal", pbrMetallicRoughness: { baseColorFactor: [0.065, 0.078, 0.105, 1], metallicFactor: 0.04, roughnessFactor: 0.82 } },
    { name: "Bright Amber Eyes", pbrMetallicRoughness: { baseColorFactor: [1, 0.72, 0.015, 1], metallicFactor: 0, roughnessFactor: 0.3 }, emissiveFactor: [1, 0.54, 0.008] },
    { name: "Eye Pupils", pbrMetallicRoughness: { baseColorFactor: [0.008, 0.012, 0.018, 1], metallicFactor: 0, roughnessFactor: 0.38 } },
    { name: "Ear Inner", pbrMetallicRoughness: { baseColorFactor: [0.17, 0.07, 0.09, 1], metallicFactor: 0, roughnessFactor: 0.85 } },
    { name: "Nose", pbrMetallicRoughness: { baseColorFactor: [0.29, 0.12, 0.15, 1], metallicFactor: 0, roughnessFactor: 0.45 } },
    { name: "Whiskers", pbrMetallicRoughness: { baseColorFactor: [0.27, 0.31, 0.37, 1], metallicFactor: 0, roughnessFactor: 0.8 } }
];

const joints = [
    { name: "Cat_Root", parent: -1, translation: [0, 0, 0] },
    { name: "Pelvis", parent: 0, translation: [0, 0.3, 0] },
    { name: "Spine", parent: 1, translation: [0, 0.28, 0] },
    { name: "Chest", parent: 2, translation: [0, 0.25, 0] },
    { name: "Head", parent: 3, translation: [0, 0.24, 0.04] },
    { name: "Ear_L", parent: 4, translation: [-0.135, 0.15, 0.005] },
    { name: "Ear_R", parent: 4, translation: [0.135, 0.15, 0.005] },
    { name: "Front_Leg_L", parent: 3, translation: [-0.19, -0.18, 0.14] },
    { name: "Front_Paw_L", parent: 7, translation: [0, -0.16, 0.035] },
    { name: "Front_Leg_R", parent: 3, translation: [0.19, -0.18, 0.14] },
    { name: "Front_Paw_R", parent: 9, translation: [0, -0.16, 0.035] },
    { name: "Hind_Leg_L", parent: 1, translation: [-0.17, -0.08, -0.06] },
    { name: "Hind_Paw_L", parent: 11, translation: [0, -0.12, 0.07] },
    { name: "Hind_Leg_R", parent: 1, translation: [0.17, -0.08, -0.06] },
    { name: "Hind_Paw_R", parent: 13, translation: [0, -0.12, 0.07] },
    { name: "Tail_01", parent: 1, translation: [0, 0.02, -0.2] },
    { name: "Tail_02", parent: 15, translation: [0, 0.055, -0.18] },
    { name: "Tail_03", parent: 16, translation: [0, 0.07, -0.16] },
    { name: "Tail_04", parent: 17, translation: [0, 0.075, -0.13] }
];

const jointIndex = Object.fromEntries(joints.map((joint, index) => [joint.name, index]));
for (const joint of joints) {
    joint.world = joint.parent < 0 ?
        joint.translation.slice() :
        joint.translation.map((value, axis) => value + joints[joint.parent].world[axis]);
}

const geometry = materials.map(() => ({ positions: [], normals: [], joints: [], weights: [], indices: [] }));

function vectorSubtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vectorCross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function vectorDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(vector) {
    const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
    return vector.map(value => value / length);
}

function addTriangle(materialIndex, jointName, pointA, pointB, pointC, normalHint) {
    const joint = joints[jointIndex[jointName]];
    const center = joint.world;
    let a = pointA;
    let b = pointB;
    let c = pointC;
    let faceNormal = vectorCross(vectorSubtract(b, a), vectorSubtract(c, a));
    if (Math.hypot(faceNormal[0], faceNormal[1], faceNormal[2]) < 1e-10) return;

    if (normalHint && vectorDot(faceNormal, normalHint) < 0) {
        [b, c] = [c, b];
        faceNormal = vectorCross(vectorSubtract(b, a), vectorSubtract(c, a));
    }

    faceNormal = normalize(faceNormal);
    const primitive = geometry[materialIndex];
    const baseIndex = primitive.positions.length / 3;

    for (const point of[a, b, c]) {
        primitive.positions.push(center[0] + point[0], center[1] + point[1], center[2] + point[2]);
        primitive.normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
        primitive.joints.push(jointIndex[jointName], 0, 0, 0);
        primitive.weights.push(1, 0, 0, 0);
    }

    primitive.indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
}

function addEllipsoid(materialIndex, jointName, center, scale, segments = 8, rings = 5) {
    const points = [];
    for (let ring = 0; ring <= rings; ring += 1) {
        const latitude = -Math.PI / 2 + Math.PI * ring / rings;
        const latitudeRadius = Math.cos(latitude);
        const height = Math.sin(latitude);
        for (let segment = 0; segment <= segments; segment += 1) {
            const longitude = 2 * Math.PI * segment / segments;
            points.push([
                center[0] + scale[0] * latitudeRadius * Math.cos(longitude),
                center[1] + scale[1] * height,
                center[2] + scale[2] * latitudeRadius * Math.sin(longitude)
            ]);
        }
    }

    for (let ring = 0; ring < rings; ring += 1) {
        for (let segment = 0; segment < segments; segment += 1) {
            const first = ring * (segments + 1) + segment;
            const next = first + segments + 1;
            const quad = [points[first], points[first + 1], points[next], points[next + 1]];
            const middle = quad.reduce((sum, point) => sum.map((value, axis) => value + point[axis] / 4), [0, 0, 0]);
            const hint = [(middle[0] - center[0]) / (scale[0] * scale[0]), (middle[1] - center[1]) / (scale[1] * scale[1]), (middle[2] - center[2]) / (scale[2] * scale[2])];
            addTriangle(materialIndex, jointName, quad[0], quad[2], quad[1], hint);
            addTriangle(materialIndex, jointName, quad[1], quad[2], quad[3], hint);
        }
    }
}

function addCone(materialIndex, jointName, baseCenter, radius, height, segments = 5) {
    const base = [];
    for (let segment = 0; segment < segments; segment += 1) {
        const angle = 2 * Math.PI * segment / segments;
        base.push([baseCenter[0] + radius * Math.cos(angle), baseCenter[1], baseCenter[2] + radius * Math.sin(angle)]);
    }
    const tip = [baseCenter[0], baseCenter[1] + height, baseCenter[2]];
    for (let segment = 0; segment < segments; segment += 1) {
        const next = (segment + 1) % segments;
        const midAngle = 2 * Math.PI * (segment + 0.5) / segments;
        addTriangle(materialIndex, jointName, base[segment], base[next], tip, [Math.cos(midAngle), radius / height, Math.sin(midAngle)]);
        addTriangle(materialIndex, jointName, baseCenter, base[next], base[segment], [0, -1, 0]);
    }
}

function addCylinder(materialIndex, jointName, start, end, radius, segments = 5) {
    const axis = normalize(vectorSubtract(end, start));
    const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const basisA = normalize(vectorCross(axis, helper));
    const basisB = normalize(vectorCross(axis, basisA));
    const lower = [];
    const upper = [];

    for (let segment = 0; segment < segments; segment += 1) {
        const angle = 2 * Math.PI * segment / segments;
        const radial = basisA.map((value, index) => radius * (value * Math.cos(angle) + basisB[index] * Math.sin(angle)));
        lower.push(start.map((value, index) => value + radial[index]));
        upper.push(end.map((value, index) => value + radial[index]));
    }

    for (let segment = 0; segment < segments; segment += 1) {
        const next = (segment + 1) % segments;
        const midAngle = 2 * Math.PI * (segment + 0.5) / segments;
        const radialHint = basisA.map((value, index) => value * Math.cos(midAngle) + basisB[index] * Math.sin(midAngle));
        addTriangle(materialIndex, jointName, lower[segment], upper[segment], lower[next], radialHint);
        addTriangle(materialIndex, jointName, lower[next], upper[segment], upper[next], radialHint);
    }
}

function addCatGeometry() {
    addEllipsoid(component.black, "Pelvis", [0, 0.02, -0.035], [0.27, 0.25, 0.28], 9, 6);
    addEllipsoid(component.black, "Spine", [0, 0.055, 0], [0.285, 0.37, 0.31], 9, 7);
    addEllipsoid(component.charcoal, "Chest", [0, 0.035, 0.055], [0.235, 0.24, 0.245], 8, 6);
    addEllipsoid(component.charcoal, "Chest", [0, 0.0, 0.26], [0.135, 0.205, 0.035], 7, 5);

    addEllipsoid(component.black, "Head", [0, 0.015, 0.025], [0.235, 0.235, 0.22], 9, 7);
    addEllipsoid(component.charcoal, "Head", [-0.062, -0.062, 0.205], [0.078, 0.052, 0.058], 7, 5);
    addEllipsoid(component.charcoal, "Head", [0.062, -0.062, 0.205], [0.078, 0.052, 0.058], 7, 5);
    addEllipsoid(component.nose, "Head", [0, -0.025, 0.263], [0.026, 0.019, 0.018], 6, 4);

    for (const side of[-1, 1]) {
        const eyeX = side * 0.092;
        addEllipsoid(component.yellow, "Head", [eyeX, 0.047, 0.207], [0.043, 0.058, 0.027], 8, 5);
        addEllipsoid(component.pupil, "Head", [eyeX, 0.047, 0.231], [0.012, 0.043, 0.008], 6, 5);
        const earName = side < 0 ? "Ear_L" : "Ear_R";
        const earX = side < 0 ? -0.015 : 0.015;
        addCone(component.black, earName, [earX, 0, 0], 0.09, 0.22, 5);
        addCone(component.ear, earName, [earX, 0.035, 0.05], 0.044, 0.115, 5);

        for (const whiskerY of[-0.065, -0.03, 0.005]) {
            const start = [side * 0.12, whiskerY, 0.228];
            const end = [side * 0.245, whiskerY + (whiskerY + 0.03) * 0.28, 0.22];
            addCylinder(component.whisker, "Head", start, end, 0.003, 4);
        }
    }

    for (const side of[-1, 1]) {
        const frontLeg = side < 0 ? "Front_Leg_L" : "Front_Leg_R";
        const frontPaw = side < 0 ? "Front_Paw_L" : "Front_Paw_R";
        const hindLeg = side < 0 ? "Hind_Leg_L" : "Hind_Leg_R";
        const hindPaw = side < 0 ? "Hind_Paw_L" : "Hind_Paw_R";

        addEllipsoid(component.black, frontLeg, [0, -0.07, 0.005], [0.078, 0.145, 0.082], 7, 5);
        addEllipsoid(component.black, frontPaw, [0, -0.025, 0.065], [0.088, 0.057, 0.115], 7, 5);
        addEllipsoid(component.black, hindLeg, [0, -0.01, -0.015], [0.145, 0.135, 0.15], 7, 5);
        addEllipsoid(component.black, hindPaw, [0, -0.015, 0.08], [0.105, 0.058, 0.135], 7, 5);

        for (let segment = 0; segment < 4; segment += 1) {
            const name = `Tail_0${segment + 1}`;
            const lengths = [
                [0.048, 0.052, 0.125],
                [0.047, 0.05, 0.12],
                [0.043, 0.046, 0.105],
                [0.036, 0.04, 0.085]
            ];
            addEllipsoid(component.black, name, [0, 0.012, -lengths[segment][2] * 0.72], lengths[segment], 6, 4);
        }
    }
}

addCatGeometry();

const chunks = [];
let binaryLength = 0;
const bufferViews = [];
const accessors = [];

function appendBytes(bytes, target) {
    while (binaryLength % 4 !== 0) {
        chunks.push(Buffer.from([0]));
        binaryLength += 1;
    }
    const byteOffset = binaryLength;
    chunks.push(bytes);
    binaryLength += bytes.length;
    const view = { buffer: 0, byteOffset, byteLength: bytes.length };
    if (target) view.target = target;
    bufferViews.push(view);
    return bufferViews.length - 1;
}

function addFloatAccessor(values, type, count, options = {}) {
    const bytes = Buffer.alloc(values.length * floatBytes);
    values.forEach((value, index) => bytes.writeFloatLE(value, index * floatBytes));
    const bufferView = appendBytes(bytes, options.target);
    const accessor = { bufferView, componentType: 5126, count, type };
    if (options.min) accessor.min = options.min;
    if (options.max) accessor.max = options.max;
    accessors.push(accessor);
    return accessors.length - 1;
}

function addJointAccessor(values, count) {
    const bytes = Buffer.from(values);
    const bufferView = appendBytes(bytes, 34962);
    accessors.push({ bufferView, componentType: 5121, count, type: "VEC4" });
    return accessors.length - 1;
}

function addIndexAccessor(values) {
    const bytes = Buffer.alloc(values.length * 2);
    values.forEach((value, index) => bytes.writeUInt16LE(value, index * 2));
    const bufferView = appendBytes(bytes, 34963);
    accessors.push({ bufferView, componentType: 5123, count: values.length, type: "SCALAR", min: [0], max: [Math.max(...values)] });
    return accessors.length - 1;
}

function bounds(values, stride) {
    const minimum = Array(stride).fill(Infinity);
    const maximum = Array(stride).fill(-Infinity);
    for (let index = 0; index < values.length; index += stride) {
        for (let axis = 0; axis < stride; axis += 1) {
            minimum[axis] = Math.min(minimum[axis], values[index + axis]);
            maximum[axis] = Math.max(maximum[axis], values[index + axis]);
        }
    }
    return { min: minimum, max: maximum };
}

const meshPrimitives = [];
for (let materialIndex = 0; materialIndex < geometry.length; materialIndex += 1) {
    const data = geometry[materialIndex];
    if (!data.indices.length) continue;
    const vertexCount = data.positions.length / 3;
    const primitiveBounds = bounds(data.positions, 3);
    meshPrimitives.push({
        attributes: {
            POSITION: addFloatAccessor(data.positions, "VEC3", vertexCount, { target: 34962, min: primitiveBounds.min, max: primitiveBounds.max }),
            NORMAL: addFloatAccessor(data.normals, "VEC3", vertexCount, { target: 34962 }),
            JOINTS_0: addJointAccessor(data.joints, vertexCount),
            WEIGHTS_0: addFloatAccessor(data.weights, "VEC4", vertexCount, { target: 34962 })
        },
        indices: addIndexAccessor(data.indices),
        material: materialIndex,
        mode: 4
    });
}

const inverseBindMatrices = [];
for (const joint of joints) {
    const [x, y, z] = joint.world;
    inverseBindMatrices.push(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -x, -y, -z, 1);
}
const inverseBindAccessor = addFloatAccessor(inverseBindMatrices, "MAT4", joints.length);

const nodes = joints.map((joint, index) => {
    const node = { name: joint.name };
    if (joint.translation.some(value => value !== 0)) node.translation = joint.translation;
    const children = joints.map((candidate, childIndex) => candidate.parent === index ? childIndex : -1).filter(childIndex => childIndex >= 0);
    if (children.length) node.children = children;
    return node;
});
const meshNodeIndex = nodes.length;
nodes.push({ name: "Black_Cat_Skinned_Mesh", mesh: 0, skin: 0 });

const animations = [];

function quaternionFromEuler(rotation) {
    const [x, y, z] = rotation.map(value => value / 2);
    const c1 = Math.cos(x),
        c2 = Math.cos(y),
        c3 = Math.cos(z);
    const s1 = Math.sin(x),
        s2 = Math.sin(y),
        s3 = Math.sin(z);
    return [s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3];
}

function addAnimation(name, duration, tracks, loop = true) {
    const samplers = [];
    const channels = [];
    for (const track of tracks) {
        const times = track.keys.map(key => key[0]);
        const values = track.keys.flatMap(key => track.path === "rotation" ? quaternionFromEuler(key[1]) : key[1]);
        const outputType = track.path === "rotation" ? "VEC4" : "VEC3";
        const outputAccessor = addFloatAccessor(values, outputType, track.keys.length);
        const inputAccessor = addFloatAccessor(times, "SCALAR", times.length, { min: [Math.min(...times)], max: [Math.max(...times)] });
        const samplerIndex = samplers.length;
        samplers.push({ input: inputAccessor, output: outputAccessor, interpolation: "LINEAR" });
        channels.push({ sampler: samplerIndex, target: { node: jointIndex[track.joint], path: track.path } });
    }
    animations.push({ name, samplers, channels, extras: { loop, duration, description: name.replaceAll("_", " ") } });
}

addAnimation("idle", 1.4, [{
        joint: "Tail_01",
        path: "rotation",
        keys: [
            [0, [0, -0.22, 0]],
            [0.35, [0, 0.22, 0]],
            [0.7, [0, -0.22, 0]],
            [1.05, [0, 0.22, 0]],
            [1.4, [0, -0.22, 0]]
        ]
    },
    {
        joint: "Tail_02",
        path: "rotation",
        keys: [
            [0, [0.04, 0.28, 0]],
            [0.35, [-0.04, -0.28, 0]],
            [0.7, [0.04, 0.28, 0]],
            [1.05, [-0.04, -0.28, 0]],
            [1.4, [0.04, 0.28, 0]]
        ]
    },
    {
        joint: "Tail_03",
        path: "rotation",
        keys: [
            [0, [0.08, -0.34, 0]],
            [0.35, [-0.08, 0.34, 0]],
            [0.7, [0.08, -0.34, 0]],
            [1.05, [-0.08, 0.34, 0]],
            [1.4, [0.08, -0.34, 0]]
        ]
    },
    {
        joint: "Tail_04",
        path: "rotation",
        keys: [
            [0, [0.12, 0.38, 0]],
            [0.35, [-0.12, -0.38, 0]],
            [0.7, [0.12, 0.38, 0]],
            [1.05, [-0.12, -0.38, 0]],
            [1.4, [0.12, 0.38, 0]]
        ]
    }
]);

addAnimation("peek", 1, [{
        joint: "Spine",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.35, [0.28, 0, 0]],
            [0.72, [0.28, 0, 0]],
            [1, [0, 0, 0]]
        ]
    },
    {
        joint: "Head",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.35, [-0.14, 0.08, 0]],
            [0.72, [-0.14, 0.08, 0]],
            [1, [0, 0, 0]]
        ]
    },
    {
        joint: "Ear_L",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.35, [0, 0, -0.12]],
            [0.72, [0, 0, -0.12]],
            [1, [0, 0, 0]]
        ]
    },
    {
        joint: "Ear_R",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.35, [0, 0, 0.12]],
            [0.72, [0, 0, 0.12]],
            [1, [0, 0, 0]]
        ]
    }
]);

addAnimation("hide", 1.15, [{
        joint: "Head",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.38, [0.1, 0, 0]],
            [0.8, [0.1, 0, 0]],
            [1.15, [0, 0, 0]]
        ]
    },
    {
        joint: "Front_Leg_L",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.38, [-1.12, 0, -0.08]],
            [0.8, [-1.12, 0, -0.08]],
            [1.15, [0, 0, 0]]
        ]
    },
    {
        joint: "Front_Leg_R",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.38, [-1.12, 0, 0.08]],
            [0.8, [-1.12, 0, 0.08]],
            [1.15, [0, 0, 0]]
        ]
    },
    {
        joint: "Front_Paw_L",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.38, [-0.24, 0, 0]],
            [0.8, [-0.24, 0, 0]],
            [1.15, [0, 0, 0]]
        ]
    },
    {
        joint: "Front_Paw_R",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.38, [-0.24, 0, 0]],
            [0.8, [-0.24, 0, 0]],
            [1.15, [0, 0, 0]]
        ]
    }
]);

addAnimation("paw_attack", 0.58, [{
        joint: "Spine",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.1, [0.1, 0, 0]],
            [0.31, [0.1, 0, 0]],
            [0.58, [0, 0, 0]]
        ]
    },
    {
        joint: "Front_Leg_L",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.12, [-0.95, 0, 0]],
            [0.22, [-0.14, 0, 0]],
            [0.31, [-1.12, 0, 0]],
            [0.4, [-0.3, 0, 0]],
            [0.58, [0, 0, 0]]
        ]
    },
    {
        joint: "Front_Paw_L",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.12, [-0.18, 0, 0]],
            [0.22, [0.56, 0, 0]],
            [0.31, [-0.32, 0, 0]],
            [0.4, [0.38, 0, 0]],
            [0.58, [0, 0, 0]]
        ]
    },
    {
        joint: "Head",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.12, [0, -0.08, 0]],
            [0.31, [0, 0.08, 0]],
            [0.58, [0, 0, 0]]
        ]
    }
]);

addAnimation("sleep", 2.4, [{
        joint: "Pelvis",
        path: "translation",
        keys: [
            [0, [0, 0.3, 0]],
            [0.6, [0, 0.16, 0]],
            [1.8, [0, 0.16, 0]],
            [2.4, [0, 0.16, 0]]
        ]
    },
    {
        joint: "Spine",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.6, [0.12, 0, 0.9]],
            [1.8, [0.12, 0, 0.9]],
            [2.4, [0, 0, 0]]
        ]
    },
    {
        joint: "Head",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.6, [0.3, 0, -0.35]],
            [1.8, [0.3, 0, -0.35]],
            [2.4, [0, 0, 0]]
        ]
    },
    {
        joint: "Front_Leg_L",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.6, [-0.62, 0, 0.38]],
            [1.8, [-0.62, 0, 0.38]],
            [2.4, [0, 0, 0]]
        ]
    },
    {
        joint: "Front_Leg_R",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.6, [-0.62, 0, -0.38]],
            [1.8, [-0.62, 0, -0.38]],
            [2.4, [0, 0, 0]]
        ]
    },
    {
        joint: "Hind_Leg_L",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.6, [0.38, 0, -0.58]],
            [1.8, [0.38, 0, -0.58]],
            [2.4, [0, 0, 0]]
        ]
    },
    {
        joint: "Hind_Leg_R",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.6, [0.38, 0, 0.58]],
            [1.8, [0.38, 0, 0.58]],
            [2.4, [0, 0, 0]]
        ]
    },
    {
        joint: "Tail_01",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.6, [0.32, 0.12, 0.3]],
            [1.8, [0.32, 0.12, 0.3]],
            [2.4, [0, 0, 0]]
        ]
    },
    {
        joint: "Tail_02",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.6, [0.42, 0.1, 0.35]],
            [1.8, [0.42, 0.1, 0.35]],
            [2.4, [0, 0, 0]]
        ]
    },
    {
        joint: "Tail_03",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.6, [0.35, -0.15, 0.4]],
            [1.8, [0.35, -0.15, 0.4]],
            [2.4, [0, 0, 0]]
        ]
    },
    {
        joint: "Tail_04",
        path: "rotation",
        keys: [
            [0, [0, 0, 0]],
            [0.6, [0.28, -0.2, 0.45]],
            [1.8, [0.28, -0.2, 0.45]],
            [2.4, [0, 0, 0]]
        ]
    }
], false);

const children = joints.map((joint, index) => joint.parent === 0 && index !== 0 ? index : -1).filter(index => index >= 0);
nodes[0].extras = { origin: "ground-level center of the cat base", upAxis: "Y", forwardAxis: "+Z" };

const gltf = {
    asset: { version: "2.0", generator: "Portfolio low-poly black cat generator", extras: { model: "Stylized black cat", animationClips: animations.map(animation => animation.name), origin: "base of body at ground plane" } },
    scene: 0,
    scenes: [{ nodes: [0, meshNodeIndex] }],
    nodes,
    meshes: [{ name: "Low_Poly_Black_Cat", primitives: meshPrimitives }],
    skins: [{ name: "Black_Cat_Rig", inverseBindMatrices: inverseBindAccessor, skeleton: 0, joints: joints.map((_, index) => index) }],
    materials,
    animations,
    accessors,
    bufferViews,
    buffers: [{ byteLength: 0 }]
};

for (const chunk of chunks) {
    if (chunk.length === 0) throw new Error("Empty binary chunk generated");
}
const binary = Buffer.concat(chunks);
gltf.buffers[0].byteLength = binary.length;

const json = Buffer.from(JSON.stringify(gltf), "utf8");
const jsonPadding = (4 - (json.length % 4)) % 4;
const paddedJson = Buffer.concat([json, Buffer.alloc(jsonPadding, 0x20)]);
const binaryPadding = (4 - (binary.length % 4)) % 4;
const paddedBinary = Buffer.concat([binary, Buffer.alloc(binaryPadding)]);
const totalLength = 12 + 8 + paddedJson.length + 8 + paddedBinary.length;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(totalLength, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(paddedJson.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(paddedBinary.length, 0);
binaryHeader.writeUInt32LE(0x004e4942, 4);

fs.writeFileSync(outputPath, Buffer.concat([header, jsonHeader, paddedJson, binaryHeader, paddedBinary]));
console.log(`Wrote ${outputPath}`);
console.log(`Joints: ${joints.length}; clips: ${animations.map(animation => animation.name).join(", ")}; bytes: ${totalLength}`);