use three_d::{Mat4, Rad, SquareMatrix, Vec3, Vec4};

pub fn transform_point(transform: Mat4, point: [f32; 3]) -> [f32; 3] {
    let value = transform * Vec4::new(point[0], point[1], point[2], 1.0);
    [value.x, value.y, value.z]
}

pub fn component_model_transform(
    offset: [f32; 3],
    rotation: [f32; 3],
    scale: [f32; 3],
    back: bool,
) -> Mat4 {
    let side = if back {
        Mat4::from_nonuniform_scale(-1.0, 1.0, -1.0)
    } else {
        Mat4::identity()
    };
    let local = Mat4::from_translation(Vec3::new(offset[0], -offset[1], offset[2]))
        * Mat4::from_angle_z(Rad(rotation[2].to_radians()))
        * Mat4::from_angle_y(Rad(-rotation[1].to_radians()))
        * Mat4::from_angle_x(Rad(-rotation[0].to_radians()))
        * Mat4::from_nonuniform_scale(scale[0], scale[1], scale[2]);
    side * local
}

pub fn pcb_model_transform(
    pose: [f32; 3],
    pose_rotation: f32,
    back: bool,
    offset: [f32; 3],
    rotation: [f32; 3],
    scale: [f32; 3],
) -> Mat4 {
    let side = if back {
        Mat4::from_angle_y(Rad(std::f32::consts::PI))
            * Mat4::from_angle_z(Rad(std::f32::consts::PI))
    } else {
        Mat4::identity()
    };
    Mat4::from_translation(Vec3::new(pose[0], pose[1], pose[2]))
        * Mat4::from_angle_z(Rad(pose_rotation.to_radians()))
        * side
        * Mat4::from_translation(Vec3::new(offset[0], offset[1], offset[2]))
        * Mat4::from_angle_z(Rad(-rotation[2].to_radians()))
        * Mat4::from_angle_y(Rad(-rotation[1].to_radians()))
        * Mat4::from_angle_x(Rad(-rotation[0].to_radians()))
        * Mat4::from_nonuniform_scale(scale[0], scale[1], scale[2])
}
