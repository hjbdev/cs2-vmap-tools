export interface PrefixElement {
    id: string;
    map_asset_references: string[];
}

interface HasType {
    __type: string;
}

export interface CMapRootElement extends HasType {
    id: string;
    isprefab: boolean;
    editorbuild: number;
    editorversion: number;
    showgrid: boolean;
    snaprotationangle: number;
    gridspacing: number;
    show3dgrid: boolean;
    itemFile: string;
    defaultcamera: CStoredCamera;
    "3dcameras": CStoredCameras;
    world: CMapWorld;
}

export type Vector3 = [number, number, number];

export interface CStoredCamera extends HasType {
    id: string;
    position: Vector3;
    lookat: Vector3;
}

export interface CStoredCameras extends HasType {
    id: string;
    activecamera: number;
    cameras: CStoredCamera[];
}

export type QAngle = [number, number, number];

export interface CMapWorld extends HasType {
    id: string;
    nextDecalID: number;
    fixupEntityNames: boolean;
    mapUsageType: string;
    relayPlugData: DmePlugList;
    connectionsData: ElementArray;
    entityProperties: EditGameClassProps;
    origin: Vector3;
    angles: QAngle;
    scales: Vector3;
    nodeID: number;
    referenceID: number;
    children: ElementArray;
}

export interface CMapEntity extends HasType {
    id: string;
    name: string;
    hitNormal: Vector3;
    isProceduralEntity: boolean;
    relayPlugData: DmePlugList;
    connectionsData: ElementArray
    entity_properties: EditGameClassProps;
    origin: Vector3;
    angles: QAngle;
    scales: Vector3;
    nodeID: number;
    referenceID: string;
    children: ElementArray;
    editorOnly: boolean;
    force_hidden: boolean;
    transformLocked: boolean;
    variableTargetKeys: string[];
    variableNames: string[];
}

export interface CMapGroup extends HasType {
    id: string;
    name: string;
    origin: Vector3;
    angles: QAngle;
    scales: Vector3;
    nodeID: number;
    referenceID: string;
    children: ElementArray;
    editorOnly: boolean;
    force_hidden: boolean;
    transformLocked: boolean;
    variableTargetKeys: string[];
    variableNames: string[];
}

export interface DmePlugList extends HasType {
    id: string;
    names: string[];
    dataTypes: number[];
    plugTypes: number[];
    descriptions: string[];
}

export interface EditGameClassProps extends HasType {
    id: string;
    classname: string;
    mapUsageType: string;
    worldname: string;
    skyname: string;
    startdark: string;
    startcolor: string;
    pvstype: string;
    newunit: string;
    maxpropscreenwidth: string;
    minpropscreenwidth: string;
    vrchaperone: string;
    vrmovement: string;
    baked_light_index_min: string;
    baked_light_index_max: string;
    max_lightmap_resolution: string;
    lightmap_queries: string;
    steamaudio_reverb_rebake_option: string;
    steamaudio_reverb_grid_spacing: string;
    steamaudio_reverb_height_above_floor: string;
    steamaudio_reverb_rays: string;
    steamaudio_reverb_bounces: string;
    steamaudio_reverb_ir_duration: string;
    steamaudio_reverb_ambisonic_order: string;
    steamaudio_pathing_rebake_option: string;
    steamaudio_pathing_grid_spacing: string;
    steamaudio_pathing_height_above_floor: string;
    steamaudio_pathing_visibility_samples: string;
    steamaudio_pathing_visibility_radius: string;
    steamaudio_pathing_visibility_threshold: string;
    steamaudio_pathing_visibility_pathrange: string;
    description: string;
    place_name: string;
    model: string;
}

export type ElementArray = any[]; // @todo

export interface VMap extends HasType { 
    "$prefix_element$": PrefixElement;
    CMapRootElement: CMapRootElement;
    CMapGroup: CMapGroup;
}