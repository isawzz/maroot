

class ValueBlend {
	constructor(options = {}) {
		this._init_corners(options);
	}
	_init_corners(options) {
		// Corners should be a list of tuples (arrays in JavaScript):
		// [bottomleft, bottomright, topleft, topright]
		if ('corners' in options) {
			this.corners = options.corners;
			if (this.corners.length !== 4 || this.corners.some(v => v.length !== 2)) {
				throw new Error("corner should be a list of four tuples, set either option 'corners' or options 'u_range' and 'v_range'");
			}
		} else if ('u_range' in options && 'v_range' in options) {
			this.corners = [
				[options['u_range'][0], options['v_range'][0]],
				[options['u_range'][1], options['v_range'][0]],
				[options['u_range'][0], options['v_range'][1]],
				[options['u_range'][1], options['v_range'][1]]
			];
		} else {
			throw new Error("Must set either option 'corners' or options 'u_range' and 'v_range'");
		}
	}
	_blend_tuples(tuple1, tuple2, ratio) {
		const out = [null, null];
		for (let i = 0; i < 2; i++) {
			out[i] = (1 - ratio) * tuple1[i] + ratio * tuple2[i];
		}
		return out;
	}

	blend(ratio_u, ratio_v) {
		// Interpolate along the U direction for the bottom and top edges.
		const uv0 = this._blend_tuples(this.corners[0], this.corners[1], ratio_u);
		const uv1 = this._blend_tuples(this.corners[2], this.corners[3], ratio_u);
		// Interpolate between the two results along the V direction.
		return this._blend_tuples(uv0, uv1, ratio_v);
	}
}

class AbstractTile extends ValueBlend {
	constructor(tessagon, options = {}) {
		super(options);
		this.tessagon = tessagon;
		this.f = tessagon.f;
		this.u_symmetric = options.hasOwnProperty('u_symmetric') ? options.u_symmetric : false;
		this.v_symmetric = options.hasOwnProperty('v_symmetric') ? options.v_symmetric : false;
		this.rot_symmetric = options.hasOwnProperty('rot_symmetry') ? options.rot_symmetry : null;
		this.id = options.hasOwnProperty('id') ? options.id : null;
		this.fingerprint = options.hasOwnProperty('fingerprint') ? options.fingerprint : null;
		this.corners = null;
		this._init_corners(options);
		this.neighbors = {
			top: null,
			bottom: null,
			left: null,
			right: null
		};
		this.twist = {
			top: false,
			bottom: false,
			left: false,
			right: false
		};
	}
	set_neighbors(options = {}) {
		if (options.hasOwnProperty('top')) {
			this.neighbors.top = options.top;
		}
		if (options.hasOwnProperty('bottom')) {
			this.neighbors.bottom = options.bottom;
		}
		if (options.hasOwnProperty('left')) {
			this.neighbors.left = options.left;
		}
		if (options.hasOwnProperty('right')) {
			this.neighbors.right = options.right;
		}
	}
	get_neighbor_tile(neighbor_keys) {
		let tile = this;
		for (const key of this._neighbor_path(neighbor_keys)) {
			if (!tile.neighbors[key]) {
				return null;
			}
			tile = tile.neighbors[key];
		}
		return tile;
	}
	get left() {
		return this.get_neighbor_tile(["left"]);
	}
	get right() {
		return this.get_neighbor_tile(["right"]);
	}
	get top() {
		return this.get_neighbor_tile(["top"]);
	}
	get bottom() {
		return this.get_neighbor_tile(["bottom"]);
	}
	inspect(options = {}) {
		if (!this.id) return;
		let prefix = 'Tile';
		if (options.hasOwnProperty('tile_number')) {
			prefix += " #" + options.tile_number;
		}
		console.log(`${prefix} (${this.constructor.name}):`);
		console.log(`  - self:      ${this.id}`);
		console.log('  - neighbors:');
		['top', 'left', 'right', 'bottom'].forEach(key => {
			if (this.neighbors[key]) {
				const tile = this.neighbors[key];
				if (tile.id) {
					console.log(`    - ${this._neighbor_str(key)}`);
				}
			}
		});
		console.log(`  - corners: (${this.corners[2][0].toFixed(4)}, ${this.corners[2][1].toFixed(4)})  (${this.corners[3][0].toFixed(4)}, ${this.corners[3][1].toFixed(4)})`);
		console.log(`             (${this.corners[0][0].toFixed(4)}, ${this.corners[0][1].toFixed(4)})  (${this.corners[1][0].toFixed(4)}, ${this.corners[1][1].toFixed(4)})`);
		console.log("  - twist:", this.twist);
		if (this.fingerprint) {
			console.log("  - fingerprint:", this.fingerprint);
		}
		console.log('');
	}
	_get_nested_list_value(nested_list, index_keys) {
		//console.log('.....',nested_list,index_keys);
		if (!Array.isArray(index_keys)) {
			return nested_list[index_keys];
		}
		let value = nested_list;
		//console.log('..value...', value);
		for (const index of index_keys) {
			value = value[index];
		}
		return value;
	}
	_set_nested_list_value(nested_list, index_keys, value) {
		if (!Array.isArray(index_keys)) {
			nested_list[index_keys] = value;
			return;
		}
		let reference = nested_list;
		for (let i = 0; i < index_keys.length - 1; i++) {
			reference = reference[index_keys[i]];
		}
		reference[index_keys[index_keys.length - 1]] = value;
	}
	_neighbor_path(neighbor_keys) {
		if (neighbor_keys.length < 2) {
			return neighbor_keys;
		}
		if (this._should_twist_u(neighbor_keys)) {
			if (['top', 'bottom'].includes(neighbor_keys[0])) {
				return [neighbor_keys[1], neighbor_keys[0]];
			}
		} else if (this._should_twist_v(neighbor_keys)) {
			if (['left', 'right'].includes(neighbor_keys[0])) {
				return [neighbor_keys[1], neighbor_keys[0]];
			}
		}
		return neighbor_keys;
	}
	_index_path(index_keys, neighbor_keys) {
		let path = index_keys;
		if (this._should_twist_u(neighbor_keys)) {
			path = this._u_flip(path);
		}
		if (this._should_twist_v(neighbor_keys)) {
			path = this._v_flip(path);
		}
		return path;
	}
	_permute_value(index_keys, vals) {
		if (Array.isArray(index_keys)) {
			return index_keys.map(u => this._permute_value(u, vals));
		}
		for (let i = 0; i < vals.length; i++) {
			if (index_keys === vals[i]) {
				return vals[(i + 1) % vals.length];
			}
		}
		return index_keys;
	}
	_swap_value(index_keys, val1, val2) {
		return this._permute_value(index_keys, [val1, val2]);
	}
	_u_flip(index_keys) {
		if (!this.u_symmetric) {
			return index_keys;
		}
		return this._swap_value(index_keys, 'left', 'right');
	}
	_v_flip(index_keys) {
		if (!this.v_symmetric) {
			return index_keys;
		}
		return this._swap_value(index_keys, 'bottom', 'top');
	}
	_rotate_index(index_keys) {
		if (!this.rot_symmetric) {
			return index_keys;
		} else if (this.rot_symmetric === 180) {
			let keys = this._permute_value(index_keys, ['rotate0', 'rotate180']);
			keys = this._permute_value(keys, ['left', 'right']);
			keys = this._permute_value(keys, ['top', 'bottom']);
			return keys;
		} else if (this.rot_symmetric === 90) {
			return this._permute_value(index_keys, ['rotate0', 'rotate90', 'rotate180', 'rotate270']);
		}
	}
	_v_index(index_keys) {
		if (index_keys.indexOf('bottom') !== -1) {
			return 'bottom';
		}
		if (index_keys.indexOf('top') !== -1) {
			return 'top';
		}
		throw new Error(`no v_index found in ${index_keys}`);
	}
	_u_index(index_keys) {
		if (index_keys.indexOf('left') !== -1) {
			return 'left';
		}
		if (index_keys.indexOf('right') !== -1) {
			return 'right';
		}
		throw new Error(`no u_index found in ${index_keys}`);
	}
	_should_twist_u(neighbor_keys) {
		for (const twist of ['top', 'bottom']) {
			if (this.twist[twist] && neighbor_keys.indexOf(twist) !== -1) {
				return true;
			}
		}
		return false;
	}
	_should_twist_v(neighbor_keys) {
		for (const twist of ['left', 'right']) {
			if (this.twist[twist] && neighbor_keys.indexOf(twist) !== -1) {
				return true;
			}
		}
		return false;
	}
	_neighbor_str(key) {
		const tile = this.neighbors[key];
		if (tile) {
			return `${(key + ":").padEnd(9, ' ')}${tile.id}`;
		}
		return `${key}: None`;
	}
}

class Tile extends AbstractTile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.mesh_adaptor = tessagon.mesh_adaptor;
		this.verts = this.init_verts();
		this.faces = this.init_faces();
		this.color_pattern = options.hasOwnProperty('color_pattern') ? options.color_pattern : null;
		if (this.faces && this.color_pattern) {
			this.face_paths = this.all_face_paths();
		}
	}
	validate() {
		// Subclass decides if this should be done
	}
	add_vert(index_keys, ratio_u, ratio_v, options = {}) {
		let vert = this._get_vert(index_keys);
		//console.log('!!!!!Tile.add_vert',vert)
		if (vert === null || vert === undefined) {
			const coords = this.f(...this.blend(ratio_u, ratio_v));
			vert = this.mesh_adaptor.create_vert(coords);
			this._set_vert(index_keys, vert);
			if (options.hasOwnProperty('vert_type')) {
				if (!this.tessagon.vert_types.hasOwnProperty(options.vert_type)) {
					this.tessagon.vert_types[options.vert_type] = [];
				}
				this.tessagon.vert_types[options.vert_type].push(vert);
			}
		}
		if (vert !== null && vert !== undefined) {
			const equivalent_verts = options.hasOwnProperty('equivalent') ? options.equivalent : [];
			for (const equivalent_vert of equivalent_verts) {
				this.set_equivalent_vert(...equivalent_vert, vert);
			}
		}
		this._create_symmetric_verts(index_keys, ratio_u, ratio_v, options);
		this._set_equivalent_neighbor_verts(index_keys, vert, options);
		return vert;
	}
	set_equivalent_vert(neighbor_keys, index_keys, vert, options = {}) {
		if (vert === null || vert === undefined) {
			return null;
		}
		const tile = this.get_neighbor_tile(neighbor_keys);
		if (tile === null) {
			return null;
		}
		tile._set_vert(this._index_path(index_keys, neighbor_keys), vert);
	}
	add_face(index_keys, vert_index_keys_list, options = {}) {
		let face = this._get_face(index_keys);
		if (face === null || face === undefined) {
			const verts = this._get_verts_from_list(vert_index_keys_list);
			if (verts !== null && verts !== undefined) {
				face = this._make_face(index_keys, verts, options);
			}
		}
		if (face !== null && face !== undefined) {
			const equivalent_faces = options.hasOwnProperty('equivalent') ? options.equivalent : [];
			for (const equivalent_face of equivalent_faces) {
				this.set_equivalent_face(...equivalent_face, face);
			}
		}
		this._create_symmetric_faces(index_keys, vert_index_keys_list, options);
		return face;
	}
	_make_face(index_keys, verts, options = {}) {
		const face = this.mesh_adaptor.create_face(verts);
		this._set_face(index_keys, face);
		if (options.hasOwnProperty('face_type')) {
			if (!this.tessagon.face_types.hasOwnProperty(options.face_type)) {
				this.tessagon.face_types[options.face_type] = [];
			}
			this.tessagon.face_types[options.face_type].push(face);
		}
		this._set_equivalent_neighbor_faces(index_keys, face, options);
		return face;
	}
	num_color_patterns() {
		return this.tessagon.num_color_patterns();
	}
	calculate_colors() {
		if (this.color_pattern > this.num_color_patterns()) {
			throw new Error("color_pattern must be below " + this.num_color_patterns());
		}
		const method_name = "color_pattern" + this.color_pattern;
		const method = this[method_name];
		if (typeof method !== 'function') {
			throw new Error(method_name + " is not a callable color pattern");
		}
		method.call(this);
	}
	color_face(index_keys, color_index) {
		const face = this._get_face(index_keys);
		if (face === null || face === undefined) {
			return;
		}
		this.mesh_adaptor.color_face(face, color_index);
	}
	set_equivalent_face(neighbor_keys, index_keys, face, options = {}) {
		const tile = this.get_neighbor_tile(neighbor_keys);
		if (tile === null) {
			return null;
		}
		tile._set_face(this._index_path(index_keys, neighbor_keys), face);
	}
	all_face_paths(faces = null, base_path = null) {
		if (faces === null) {
			faces = this.faces;
		}
		if (base_path === null) {
			base_path = [];
		}
		let paths = [];
		for (const index in faces) {
			const new_base_path = base_path.concat([index]);
			if (typeof faces[index] === 'object' && !Array.isArray(faces[index]) && faces[index] !== null) {
				paths = paths.concat(this.all_face_paths(faces[index], new_base_path));
			} else {
				paths.push(new_base_path);
			}
		}
		return paths;
	}
	color_paths(paths, color, color_other = null) {
		for (const path of this.face_paths) {
			if (paths.some(p => JSON.stringify(p) === JSON.stringify(path))) {
				this.color_face(path, color);
			} else if (color_other) {
				this.color_face(path, color_other);
			}
		}
	}
	color_paths_hash(hash, color_other = null) {
		for (const path of this.face_paths) {
			let done = false;
			for (const color in hash) {
				if (hash[color].some(p => JSON.stringify(p) === JSON.stringify(path))) {
					this.color_face(path, color);
					done = true;
					break;
				}
			}
			if (color_other && !done) {
				this.color_face(path, color_other);
			}
		}
	}
	_get_vert(index_keys) {
		return this._get_nested_list_value(this.verts, index_keys);
	}
	_set_vert(index_keys, value) {
		this._set_nested_list_value(this.verts, index_keys, value);
	}
	_get_face(index_keys) {
		return this._get_nested_list_value(this.faces, index_keys);
	}
	_set_face(index_keys, value) {
		this._set_nested_list_value(this.faces, index_keys, value);
	}
	_get_neighbor_vert(neighbor_keys, index_keys) {
		const tile = this.get_neighbor_tile(neighbor_keys);
		if (tile === null) {
			return null;
		}
		return tile._get_vert(this._index_path(index_keys, neighbor_keys));
	}
	_create_symmetric_verts(index_keys, ratio_u, ratio_v, options = {}) {
		if (!options.hasOwnProperty('symmetry')) {
			const extra_args = { symmetry: true };
			if (this.rot_symmetric === 180) {
				let rot_keys = this._rotate_index(index_keys);
				this.add_vert(rot_keys, 1.0 - ratio_u, 1 - ratio_v, Object.assign({}, options, extra_args));
			} else if (this.rot_symmetric === 90) {
				let rot_keys = this._rotate_index(index_keys);
				this.add_vert(rot_keys, 1.0 - ratio_v, ratio_u, Object.assign({}, options, extra_args));
				rot_keys = this._rotate_index(rot_keys);
				this.add_vert(rot_keys, 1.0 - ratio_u, 1 - ratio_v, Object.assign({}, options, extra_args));
				rot_keys = this._rotate_index(rot_keys);
				this.add_vert(rot_keys, ratio_v, 1 - ratio_u, Object.assign({}, options, extra_args));
			}
			if (this.u_symmetric) {
				let u_flip_keys = this._u_flip(index_keys);
				this.add_vert(u_flip_keys, 1.0 - ratio_u, ratio_v, Object.assign({}, options, extra_args));
				if (this.v_symmetric) {
					let uv_flip_keys = this._v_flip(u_flip_keys);
					this.add_vert(uv_flip_keys, 1.0 - ratio_u, 1.0 - ratio_v, Object.assign({}, options, extra_args));
				}
			}
			if (this.v_symmetric) {
				let v_flip_keys = this._v_flip(index_keys);
				this.add_vert(v_flip_keys, ratio_u, 1.0 - ratio_v, Object.assign({}, options, extra_args));
			}
		}
	}
	_set_equivalent_neighbor_verts(index_keys, vert, options = {}) {
		if (options.hasOwnProperty('u_boundary')) {
			this._set_u_equivalent_vert(index_keys, vert, options);
		}
		if (options.hasOwnProperty('v_boundary')) {
			this._set_v_equivalent_vert(index_keys, vert, options);
		}
		if (options.hasOwnProperty('corner')) {
			this._set_u_equivalent_vert(index_keys, vert, options);
			this._set_v_equivalent_vert(index_keys, vert, options);
			this._set_uv_equivalent_vert(index_keys, vert, options);
		}
	}
	_set_u_equivalent_vert(index_keys, vert, options = {}) {
		const u_index = this._u_index(index_keys);
		const u_flip_keys = this._u_flip(index_keys);
		this.set_equivalent_vert([u_index], u_flip_keys, vert, options);
	}
	_set_v_equivalent_vert(index_keys, vert, options = {}) {
		const v_index = this._v_index(index_keys);
		const v_flip_keys = this._v_flip(index_keys);
		this.set_equivalent_vert([v_index], v_flip_keys, vert, options);
	}
	_set_uv_equivalent_vert(index_keys, vert, options = {}) {
		const u_index = this._u_index(index_keys);
		const v_index = this._v_index(index_keys);
		const u_flip_keys = this._u_flip(index_keys);
		const uv_flip_keys = this._v_flip(u_flip_keys);
		this.set_equivalent_vert([u_index, v_index], uv_flip_keys, vert, options);
	}
	_get_verts_from_list(vert_index_keys_list) {
		const verts = [];
		for (const vert_index_keys of vert_index_keys_list) {
			let vert;
			if (Array.isArray(vert_index_keys) && Array.isArray(vert_index_keys[0])) {
				vert = this._get_neighbor_vert(vert_index_keys[0], vert_index_keys[1]);
			} else {
				vert = this._get_vert(vert_index_keys);
			}
			if (vert === null || vert === undefined) {
				return null;
			}
			verts.push(vert);
		}
		return verts;
	}
	_create_symmetric_faces(index_keys, vert_index_keys_list, options = {}) {
		if (!options.hasOwnProperty('symmetry')) {
			const extra_args = { symmetry: true };
			if (this.rot_symmetric === 180) {
				let rot_keys = this._rotate_index(index_keys);
				let rot_vert_index_keys_list = this._rotate_index(vert_index_keys_list);
				if (options.hasOwnProperty('equivalent')) {
					const equivalent_faces = options.equivalent;
					const new_opts = Object.assign({}, options);
					new_opts.equivalent = equivalent_faces.map(equiv => this._rotate_index(equiv));
					options = new_opts;
				}
				this.add_face(rot_keys, rot_vert_index_keys_list, Object.assign({}, options, extra_args));
			}
			if (this.u_symmetric) {
				let u_flip_keys = this._u_flip(index_keys);
				let u_flip_vert_index_keys_list = this._u_flip(vert_index_keys_list);
				this.add_face(u_flip_keys, u_flip_vert_index_keys_list, Object.assign({}, options, extra_args));
				if (this.v_symmetric) {
					let uv_flip_keys = this._v_flip(u_flip_keys);
					let uv_flip_vert_index_keys_list = this._v_flip(u_flip_vert_index_keys_list);
					this.add_face(uv_flip_keys, uv_flip_vert_index_keys_list, Object.assign({}, options, extra_args));
				}
			}
			if (this.v_symmetric) {
				let v_flip_keys = this._v_flip(index_keys);
				let v_flip_vert_index_keys_list = this._v_flip(vert_index_keys_list);
				this.add_face(v_flip_keys, v_flip_vert_index_keys_list, Object.assign({}, options, extra_args));
			}
		}
	}
	_set_equivalent_neighbor_faces(index_keys, face, options = {}) {
		if (options.hasOwnProperty('u_boundary')) {
			this._set_u_equivalent_face(index_keys, face, options);
		}
		if (options.hasOwnProperty('v_boundary')) {
			this._set_v_equivalent_face(index_keys, face, options);
		}
		if (options.hasOwnProperty('corner')) {
			this._set_u_equivalent_face(index_keys, face, options);
			this._set_v_equivalent_face(index_keys, face, options);
			this._set_uv_equivalent_face(index_keys, face, options);
		}
	}
	_set_u_equivalent_face(index_keys, face, options = {}) {
		const u_index = this._u_index(index_keys);
		const u_flip_keys = this._u_flip(index_keys);
		this.set_equivalent_face([u_index], u_flip_keys, face, options);
	}
	_set_v_equivalent_face(index_keys, face, options = {}) {
		const v_index = this._v_index(index_keys);
		const v_flip_keys = this._v_flip(index_keys);
		this.set_equivalent_face([v_index], v_flip_keys, face, options);
	}
	_set_uv_equivalent_face(index_keys, face, options = {}) {
		const u_index = this._u_index(index_keys);
		const v_index = this._v_index(index_keys);
		const u_flip_keys = this._u_flip(index_keys);
		const uv_flip_keys = this._v_flip(u_flip_keys);
		this.set_equivalent_face([u_index, v_index], uv_flip_keys, face, options);
	}
}

class TileGenerator extends ValueBlend {
	constructor(tessagon, options = {}) {
		super(options);
		this.tessagon = tessagon;
		this.corners = null;
		this._init_corners(options);
		this.u_num = options.u_num;
		this.v_num = options.v_num;
		if (!this.u_num || !this.v_num) {
			throw new Error("Make sure u_num and v_num intervals are set");
		}
		this.u_cyclic = options.hasOwnProperty('u_cyclic') ? options.u_cyclic : true;
		this.v_cyclic = options.hasOwnProperty('v_cyclic') ? options.v_cyclic : true;
		this.v_twist = options.hasOwnProperty('v_twist') ? options.v_twist : false;
		this.u_twist = options.hasOwnProperty('u_twist') ? options.u_twist : false;
		this.u_phase = options.hasOwnProperty('u_phase') ? options.u_phase : 0.0;
		this.v_phase = options.hasOwnProperty('v_phase') ? options.v_phase : 0.0;
		this.u_shear = options.hasOwnProperty('u_shear') ? options.u_shear : 0.0;
		this.v_shear = options.hasOwnProperty('v_shear') ? options.v_shear : 0.0;
		this.id_prefix = tessagon.constructor.name;
		if (options.hasOwnProperty('id_prefix')) {
			this.id_prefix = options.id_prefix;
		}
		this.fingerprint_offset = options.hasOwnProperty('fingerprint_offset') ? options.fingerprint_offset : null;
		this.color_pattern = options.hasOwnProperty('color_pattern') ? options.color_pattern : null;
	}
	create_tile(u, v, corners, options = {}) {
		const extra_args = {
			corners: corners,
			fingerprint: [u, v]
		};
		if (this.fingerprint_offset) {
			extra_args.fingerprint[0] += this.fingerprint_offset[0];
			extra_args.fingerprint[1] += this.fingerprint_offset[1];
		}
		if (this.id_prefix) {
			extra_args.id = `${this.id_prefix}[${u}][${v}]`;
		}
		if (this.color_pattern) {
			extra_args.color_pattern = this.color_pattern;
		}
		const extra_parameters = this.tessagon.extra_parameters;
		if (extra_parameters) {
			for (const parameter in extra_parameters) {
				if (extra_parameters.hasOwnProperty(parameter)) {
					extra_args[parameter] = extra_parameters[parameter];
				}
			}
		}
		const tile_class = this.tessagon.constructor.tile_class;
		return new tile_class(this.tessagon, Object.assign({}, options, extra_args));
	}
	create_tiles() {
		this.initialize_tiles();
		this.initialize_neighbors();
		const tiles = this.get_tiles();
		for (const tile of tiles) {
			tile.validate();
		}
		return tiles;
	}
}

class AlternatingTile extends Tile {
	validate() {
		const this_tile_type = this.tile_type;
		for (const name in this.neighbors) {
			const neighbor = this.neighbors[name];
			if (neighbor && (neighbor.tile_type + this_tile_type !== 1)) {
				throw new Error("Tiles have bad parity (hint: maybe use an even number of tiles)");
			}
		}
	}
	get tile_type() {
		return this.fingerprint.reduce((sum, value) => sum + value, 0) % 2;
	}
}

class GridTileGenerator extends TileGenerator {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.tiles = null;
	}
	initialize_tiles(options = {}) {
		let tiles = [];
		for (let u = 0; u < this.u_num; u++) {
			tiles[u] = new Array(this.v_num).fill(null);
		}
		for (let u = 0; u < this.u_num; u++) {
			let u_ratio0 = u / this.u_num;
			let u_ratio1 = (u + 1) / this.u_num;
			let v_shear0 = u * this.v_shear;
			let v_shear1 = (u + 1) * this.v_shear;
			for (let v = 0; v < this.v_num; v++) {
				let v_ratio0 = v / this.v_num;
				let v_ratio1 = (v + 1) / this.v_num;
				let u_shear0 = v * this.u_shear;
				let u_shear1 = (v + 1) * this.u_shear;
				let corners = [
					this.blend(u_ratio0 + u_shear0 + this.u_phase, v_ratio0 + v_shear0 + this.v_phase),
					this.blend(u_ratio1 + u_shear0 + this.u_phase, v_ratio0 + v_shear1 + this.v_phase),
					this.blend(u_ratio0 + u_shear1 + this.u_phase, v_ratio1 + v_shear0 + this.v_phase),
					this.blend(u_ratio1 + u_shear1 + this.u_phase, v_ratio1 + v_shear1 + this.v_phase)
				];
				tiles[u][v] = this.create_tile(u, v, corners, options);
			}
		}
		this.tiles = tiles;
		return tiles;
	}
	initialize_neighbors(options = {}) {
		let tiles = this.tiles;
		for (let u = 0; u < this.u_num; u++) {
			let u_prev = (u - 1 + this.u_num) % this.u_num;
			let u_next = (u + 1) % this.u_num;
			for (let v = 0; v < this.v_num; v++) {
				let v_prev = (v - 1 + this.v_num) % this.v_num;
				let v_next = (v + 1) % this.v_num;
				let tile = tiles[u][v];
				let left, top, right, bottom;
				if (!this.u_cyclic && u === 0) {
					left = null;
				} else if (this.v_twist && u === 0) {
					left = tiles[u_prev][this.v_num - v - 1];
					tile.twist['left'] = true;
				} else {
					left = tiles[u_prev][v];
				}
				if (!this.v_cyclic && v === this.v_num - 1) {
					top = null;
				} else if (this.u_twist && v === this.v_num - 1) {
					top = tiles[this.u_num - u - 1][v_next];
					tile.twist['top'] = true;
				} else {
					top = tiles[u][v_next];
				}
				if (!this.u_cyclic && u === this.u_num - 1) {
					right = null;
				} else if (this.v_twist && u === this.u_num - 1) {
					right = tiles[u_next][this.v_num - v - 1];
					tile.twist['right'] = true;
				} else {
					right = tiles[u_next][v];
				}
				if (!this.v_cyclic && v === 0) {
					bottom = null;
				} else if (this.u_twist && v === 0) {
					bottom = tiles[this.u_num - u - 1][v_prev];
					tile.twist['bottom'] = true;
				} else {
					bottom = tiles[u][v_prev];
				}
				tile.set_neighbors({ left: left, right: right, top: top, bottom: bottom });
			}
		}
	}
	get_tiles() {
		return this.tiles.flat();
	}
}

class ParallelogramTileGenerator extends TileGenerator {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.p = options.parallelogram_vectors;
		this.determinant = this.p[0][0] * this.p[1][1] - this.p[1][0] * this.p[0][1];
		this.validate_parallelogram();
		this.inverse = [
			[this.p[1][1] / (this.determinant * this.u_num), -this.p[1][0] / (this.determinant * this.u_num)],
			[-this.p[0][1] / (this.determinant * this.v_num), this.p[0][0] / (this.determinant * this.v_num)]
		];
		this.color_pattern = options.hasOwnProperty('color_pattern') ? options.color_pattern : null;
		this.id_prefix = 'parallelogram_tiles';
		this.tiles = {};
	}
	validate_parallelogram() {
		let error = null;
		if (this.p[0][0] <= 0) {
			error = "First parallelogram vector can't have negative u";
		} else if (this.p[1][1] <= 0) {
			error = "Second parallelogram vector can't have negative v";
		}
		if (this.determinant === 0) {
			error = "Parallelogram vector are colinear";
		} else if (this.determinant < 0) {
			error = "First parallelogram vector is to the left of second";
		}
		if (error) {
			throw new Error(error);
		}
	}
	initialize_tiles() {
		let tiles = {};
		const fingerprintRange = this.fingerprint_range();
		for (let u = fingerprintRange.u_range[0]; u < fingerprintRange.u_range[1]; u++) {
			for (let v = fingerprintRange.v_range[0]; v < fingerprintRange.v_range[1]; v++) {
				const fingerprint = this.normalize_fingerprint(u, v);
				const fingerprint_str = fingerprint.toString();
				if (!tiles.hasOwnProperty(fingerprint_str)) {
					if (this.valid_fingerprint(...fingerprint)) {
						tiles[fingerprint_str] = this.make_tile(...fingerprint);
					}
				}
			}
		}
		this.tiles = tiles;
		return tiles;
	}
	initialize_neighbors() {
		for (const tile of this.get_tiles()) {
			const u = tile.fingerprint[0];
			const v = tile.fingerprint[1];
			let fingerprint = this.normalize_fingerprint(u - 1, v);
			let left = this.tiles[fingerprint.toString()] || null;
			fingerprint = this.normalize_fingerprint(u + 1, v);
			let right = this.tiles[fingerprint.toString()] || null;
			fingerprint = this.normalize_fingerprint(u, v - 1);
			let bottom = this.tiles[fingerprint.toString()] || null;
			fingerprint = this.normalize_fingerprint(u, v + 1);
			let top = this.tiles[fingerprint.toString()] || null;
			tile.set_neighbors({ left: left, right: right, top: top, bottom: bottom });
		}
	}
	get_tiles() {
		return Object.values(this.tiles);
	}
	make_tile(...fingerprint) {
		const corners = this.make_corners(...fingerprint);
		return this.create_tile(fingerprint[0], fingerprint[1], corners);
	}
	make_corners(...fingerprint) {
		const u = fingerprint[0];
		const v = fingerprint[1];
		return [
			this.make_corner(u, v),
			this.make_corner(u + 1, v),
			this.make_corner(u, v + 1),
			this.make_corner(u + 1, v + 1)
		];
	}
	make_corner(u, v) {
		const c0 = this.inverse[0][0] * u + this.inverse[0][1] * v;
		const c1 = this.inverse[1][0] * u + this.inverse[1][1] * v;
		return this.blend(c0, c1);
	}
	valid_fingerprint(u, v) {
		if (!this.point_in_parallelogram(u, v)) return false;
		let fingerprint = this.normalize_fingerprint(u + 1, v);
		if (!this.point_in_parallelogram(...fingerprint)) return false;
		fingerprint = this.normalize_fingerprint(u, v + 1);
		if (!this.point_in_parallelogram(...fingerprint)) return false;
		fingerprint = this.normalize_fingerprint(u + 1, v + 1);
		if (!this.point_in_parallelogram(...fingerprint)) return false;
		return true;
	}
	parallelogram_coord(u, v) {
		const u_coord = (u * this.p[1][1] - v * this.p[1][0]) / this.determinant;
		const v_coord = (v * this.p[0][0] - u * this.p[0][1]) / this.determinant;
		return [u_coord, v_coord];
	}
	point_in_parallelogram(u, v) {
		const parallelogram_uv = this.parallelogram_coord(u, v);
		if (0.0 <= parallelogram_uv[0] && parallelogram_uv[0] <= this.u_num) {
			if (0.0 <= parallelogram_uv[1] && parallelogram_uv[1] <= this.v_num) {
				return true;
			}
		}
		return false;
	}
	normalize_fingerprint(u, v) {
		while (true) {
			const u_old = u;
			const v_old = v;
			const parallelogram_uv = this.parallelogram_coord(u, v);
			if (this.u_cyclic) {
				if (parallelogram_uv[0] >= this.u_num) {
					u -= (this.u_num * this.p[0][0]);
					v -= (this.u_num * this.p[0][1]);
				} else if (parallelogram_uv[0] < 0.0) {
					u += (this.u_num * this.p[0][0]);
					v += (this.u_num * this.p[0][1]);
				}
			}
			if (this.v_cyclic) {
				if (parallelogram_uv[1] >= this.v_num) {
					u -= (this.v_num * this.p[1][0]);
					v -= (this.v_num * this.p[1][1]);
				} else if (parallelogram_uv[1] < 0.0) {
					u += (this.v_num * this.p[1][0]);
					v += (this.v_num * this.p[1][1]);
				}
			}
			if (u === u_old && v === v_old) {
				return [u, v];
			}
		}
	}
	fingerprint_range() {
		const u_min = Math.min(
			0,
			this.u_num * this.p[0][0],
			this.v_num * this.p[1][0],
			this.u_num * this.p[0][0] + this.v_num * this.p[1][0]
		);
		const u_max = Math.max(
			0,
			this.u_num * this.p[0][0],
			this.v_num * this.p[1][0],
			this.u_num * this.p[0][0] + this.v_num * this.p[1][0]
		);
		const v_min = Math.min(
			0,
			this.u_num * this.p[0][1],
			this.v_num * this.p[1][1],
			this.u_num * this.p[0][1] + this.v_num * this.p[1][1]
		);
		const v_max = Math.max(
			0,
			this.u_num * this.p[0][1],
			this.v_num * this.p[1][1],
			this.u_num * this.p[0][1] + this.v_num * this.p[1][1]
		);
		return {
			u_range: [u_min, u_max],
			v_range: [v_min, v_max]
		};
	}
}

class TessagonMetadata {
	static CLASSIFICATION_MAP = {
		'regular': 'Regular tiling',
		'archimedean': 'Archimedean tiling',
		'laves': 'Laves tiling',
		'non_edge': 'Non-edge-to-edge tiling',
		'non_convex': 'Non-convex tiling'
	};
	constructor(options = {}) {
		this._name = options.name;
		if (!this._name) {
			throw new Error('No name set');
		}
		this._num_color_patterns = options.num_color_patterns !== undefined ? options.num_color_patterns : 0;
		this._classification = options.classification || 'misc';
		this._shapes = options.shapes || [];
		this._sides = options.sides || [];
		this._uv_ratio = options.hasOwnProperty('uv_ratio') ? options.uv_ratio : null;
		this._extra_parameters = options.extra_parameters || {};
	}
	get name() {
		return this._name;
	}
	get num_color_patterns() {
		return this._num_color_patterns;
	}
	get has_color_patterns() {
		return this._num_color_patterns > 0;
	}
	has_shape(shape) {
		return this._shapes.includes(shape);
	}
	get classification() {
		return this._classification;
	}
	has_classification(classification) {
		return this._classification === classification;
	}
	get human_readable_classification() {
		return TessagonMetadata.CLASSIFICATION_MAP[this._classification];
	}
	get uv_ratio() {
		return this._uv_ratio;
	}
	get extra_parameters() {
		return this._extra_parameters;
	}
}

class Tessagon {
	static tile_class = null;
	static metadata = null;
	constructor(options = {}) {
		if (options.hasOwnProperty('tile_generator')) {
			this.tile_generator = new options.tile_generator(this, options);
		} else if (options.hasOwnProperty('rot_factor')) {
			const rot_factor = options.rot_factor;
			const extra_args = {
				parallelogram_vectors: [[rot_factor, -1], [1, rot_factor]]
			};
			this.tile_generator = new ParallelogramTileGenerator(this, Object.assign({}, options, extra_args));
		} else if (options.hasOwnProperty('parallelogram_vectors')) {
			this.tile_generator = new ParallelogramTileGenerator(this, options);
		} else {
			this.tile_generator = new GridTileGenerator(this, options);
		}
		this._initialize_function(options);
		this.post_process = options.hasOwnProperty('post_process') ? options.post_process : null;
		if (options.hasOwnProperty('adaptor_class')) {
			const adaptor_class = options.adaptor_class;
			const adaptor_options = {};
			for (const option of adaptor_class.ADAPTOR_OPTIONS) {
				if (options.hasOwnProperty(option)) {
					adaptor_options[option] = options[option];
				}
			}
			this.mesh_adaptor = new adaptor_class(adaptor_options);
		} else {
			throw new Error('Must provide a mesh adaptor class');
		}
		this.color_pattern = options.hasOwnProperty('color_pattern') ? options.color_pattern : null;
		this.tiles = null;
		this.face_types = {};
		this.vert_types = {};
		this._process_extra_parameters(options);
	}
	create_mesh() {
		this._initialize_tiles();
		this.mesh_adaptor.create_empty_mesh();
		this._calculate_verts();
		this._calculate_faces();
		if (this.color_pattern) {
			this._calculate_colors();
		}
		this.mesh_adaptor.finish_mesh();
		if (this.post_process) {
			this.post_process(this);
		}
		return this.mesh_adaptor.get_mesh();
	}
	inspect() {
		console.log(`\n=== ${this.constructor.name} ===\n`);
		for (let i = 0; i < this.tiles.length; i++) {
			this.tiles[i].inspect({ tile_number: i });
		}
	}
	static num_color_patterns() {
		if (this.metadata === null) {
			return 0;
		}
		return this.metadata.num_color_patterns;
	}
	static num_extra_parameters() {
		if (this.metadata === null) {
			return 0;
		}
		return Object.keys(this.metadata.extra_parameters).length;
	}
	// Protected methods
	_initialize_function(options = {}) {
		this.f = null;
		if (options.hasOwnProperty('simple_2d')) {
			let u_multiplier_2d = 1.0;
			let v_multiplier_2d = 1.0;
			if (Tessagon.metadata && Tessagon.metadata.uv_ratio) {
				v_multiplier_2d = 1.0 / Tessagon.metadata.uv_ratio;
			}
			const tile_aspect = this.tile_generator.v_num / this.tile_generator.u_num;
			const multiplier_2d = options.hasOwnProperty('multiplier_2d') ? options.multiplier_2d : 1.0;
			u_multiplier_2d *= multiplier_2d;
			v_multiplier_2d *= multiplier_2d * tile_aspect;
			const translate_2d = options.hasOwnProperty('translate_2d') ? options.translate_2d : [0, 0];
			this.f = (u, v) => {
				return (
					translate_2d[0] + u_multiplier_2d * u,
					translate_2d[1] + v_multiplier_2d * v,
					0.0
				);
			};
			// Alternatively, to return as an array:
			this.f = (u, v) => [
				translate_2d[0] + u_multiplier_2d * u,
				translate_2d[1] + v_multiplier_2d * v,
				0.0
			];
		} else if (options.hasOwnProperty('function')) {
			this.f = options.function;
		} else {
			throw new Error('Must specify a function');
		}
	}
	_initialize_tiles() {
		this.tiles = this.tile_generator.create_tiles();
	}
	_calculate_verts() {
		for (const tile of this.tiles) {
			tile.calculate_verts();
		}
	}
	_calculate_faces() {
		for (const tile of this.tiles) {
			tile.calculate_faces();
		}
	}
	_calculate_colors() {
		this.mesh_adaptor.initialize_colors();
		for (const tile of this.tiles) {
			tile.calculate_colors();
		}
	}
	_process_extra_parameters(options = {}) {
		this.extra_parameters = {};
		const parameters_info = Tessagon.metadata ? Tessagon.metadata.extra_parameters : null;
		if (!parameters_info) {
			return;
		}
		for (const parameter in parameters_info) {
			if (!options.hasOwnProperty(parameter)) {
				continue;
			}
			const value = options[parameter];
			if (parameters_info[parameter]['type'] === 'float') {
				this._process_float_extra_parameter(parameter, value, parameters_info[parameter]);
			}
		}
	}
	_process_float_extra_parameter(parameter, value, parameter_info) {
		const max_value = parameter_info.hasOwnProperty('max') ? parameter_info.max : null;
		const min_value = parameter_info.hasOwnProperty('min') ? parameter_info.min : null;
		if (max_value !== null && value > max_value) {
			throw new Error(`Parameter ${parameter} (${value}) exceeds maximum (${max_value})`);
		}
		if (min_value !== null && value < min_value) {
			throw new Error(`Parameter ${parameter} (${value}) below minimum (${min_value})`);
		}
		this.extra_parameters[parameter] = value;
	}
}

class BaseAdaptor {
	static ADAPTOR_OPTIONS = [];
}

class ListAdaptor extends BaseAdaptor {
	constructor(options = {}) {
		super();
		this.vert_list = null;
		this.face_list = null;
		this.color_list = null;
	}
	create_empty_mesh() {
		this.vert_list = [];
		this.face_list = [];
		this.color_list = [];
	}
	initialize_colors() {
		this.color_list = new Array(this.face_list.length).fill(0);
	}
	create_vert(coords) {
		this.vert_list.push(coords);
		return this.vert_list.length - 1;
	}
	create_face(verts) {
		this.face_list.push(verts);
		return this.face_list.length - 1;
	}
	color_face(face, color_index) {
		this.color_list[face] = color_index;
	}
	finish_mesh() {
		// No operation
	}
	get_mesh() {
		return {
			vert_list: this.vert_list,
			face_list: this.face_list,
			color_list: this.color_list
		};
	}
}

class SvgAdaptor extends ListAdaptor {
	static ADAPTOR_OPTIONS = ['svg_root_tag', 'svg_style', 'svg_fill_color', 'svg_fill_colors', 'svg_stroke_color', 'svg_stroke_width'];
	constructor(options = {}) {
		super(options);
		this.svg_root_tag = options.hasOwnProperty('svg_root_tag') ? options.svg_root_tag : false;
		this.style = options.svg_style;
		this.svg_fill_colors = options.svg_fill_colors;
		this.svg_fill_color = options.svg_fill_color;
		this.svg_stroke_color = options.svg_stroke_color;
		this.svg_stroke_width = options.svg_stroke_width;
	}
	get_mesh() {
		let buffer = "";
		if (this.svg_root_tag) {
			if (this.svg_root_tag === true) {
				buffer += '<svg xmlns="http://www.w3.org/2000/svg">\n';
			} else {
				buffer += this.svg_root_tag;
			}
		}
		buffer += `<g${this.group_style()}>\n`;
		if (this.style) {
			buffer += `<style>${this.style}</style>`;
		}
		if (this.svg_fill_colors) {
			const color_indices = this.make_color_indices();
			for (let i = 0; i < this.svg_fill_colors.length; i++) {
				if (!(i in color_indices)) {
					continue;
				}
				const fill_color = this.svg_fill_colors[i];
				const faces = color_indices[i].map(j => this.face_list[j]);
				buffer += this.make_color_group(faces, fill_color);
			}
		} else {
			for (const face of this.face_list) {
				buffer += this.make_face(face);
			}
		}
		buffer += "</g>\n";
		if (this.svg_root_tag) {
			buffer += "</svg>\n";
		}
		return buffer;
	}
	group_style() {
		let style = "";
		if (this.svg_stroke_color) {
			style += `stroke:${this.svg_stroke_color};`;
		}
		if (this.svg_stroke_width) {
			style += `stroke-width:${this.svg_stroke_width};`;
		}
		if (this.svg_fill_color) {
			style += `fill:${this.svg_fill_color};`;
		}
		if (style.length > 0) {
			style = ` style="${style}"`;
		}
		return style;
	}
	make_color_indices() {
		const color_indices = {};
		for (let i = 0; i < this.color_list.length; i++) {
			const color = this.color_list[i];
			if (!(color in color_indices)) {
				color_indices[color] = [];
			}
			color_indices[color].push(i);
		}
		return color_indices;
	}
	make_color_group(faces, fill_color) {
		let buffer = `<g style="fill:${fill_color};">\n`;
		for (const face of faces) {
			buffer += this.make_face(face);
		}
		buffer += '</g>\n';
		return buffer;
	}
	make_face(face) {
		const verts = face.map(v => this.vert_list[v]);
		const points_string = verts.map(vert => `${vert[0]},${vert[1]}`).join(" ");
		return `<polygon points="${points_string}" />`;
	}
}

function right_tile(index_keys) {
	return [['right'], index_keys];
}
function left_tile(index_keys) {
	return [['left'], index_keys];
}
function top_tile(index_keys) {
	return [['top'], index_keys];
}
function bottom_tile(index_keys) {
	return [['bottom'], index_keys];
}
function left_top_tile(index_keys) {
	return [['left', 'top'], index_keys];
}
function left_bottom_tile(index_keys) {
	return [['left', 'bottom'], index_keys];
}
function right_top_tile(index_keys) {
	return [['right', 'top'], index_keys];
}
function right_bottom_tile(index_keys) {
	return [['right', 'bottom'], index_keys];
}
function bottom_left_tile(index_keys) {
	return [['bottom', 'left'], index_keys];
}
function bottom_right_tile(index_keys) {
	return [['bottom', 'right'], index_keys];
}
function top_left_tile(index_keys) {
	return [['top', 'left'], index_keys];
}
function top_right_tile(index_keys) {
	return [['top', 'right'], index_keys];
}

const big_hex_tri_metadata = new TessagonMetadata({
	name: "Big Hexagons and Triangles",
	num_color_patterns: 1,
	classification: "archimedean",
	shapes: ["hexagons", "triangles"],
	sides: [6, 3],
	uv_ratio: 1.0 / Math.sqrt(3),
	extra_parameters: {
		hexagon_ratio: {
			type: "float",
			min: 0.0,
			max: 0.70,
			default: 0.5,
			description: "Control the size of the Hexagons"
		}
	}
});
class BigHexTriTile extends AlternatingTile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = false;
		this.v_symmetric = false;
		this.hexagon_ratio = options.hasOwnProperty("hexagon_ratio")
			? options.hexagon_ratio
			: 0.5;
		this.hex_radius = (4 * this.hexagon_ratio) / Math.sqrt(7);
		console.log
		this.uv_ratio = BigHexTriTessagon.metadata.uv_ratio;
		this.theta_offset = -Math.atan2(1, 3 * Math.sqrt(3)) + Math.PI / 6;
		this.hex_theta = [];
		for (let number = 0; number < 6; number++) {
			this.hex_theta.push(this.theta_offset + (number * Math.PI) / 3.0);
		}
	}
	hex_vert_coord(center, number) {
		return [
			center[0] + this.hex_radius * Math.cos(this.hex_theta[number]),
			center[1] + this.hex_radius * Math.sin(this.hex_theta[number]) * this.uv_ratio
		];
	}
	init_verts() {
		if (this.tile_type === 0) {
			return { 0: null, 1: null };
		} else {
			return { 2: null, 3: null, 4: null, 5: null };
		}
	}
	init_faces() {
		if (this.tile_type === 0) {
			return {
				A: null,
				B: null,
				C: null,
				D: null,
				E: null,
				F: null,
				G: null,
				H: null
			};
		} else {
			return {
				I: null,
				J: null,
				K: null,
				L: null,
				M: null,
				N: null,
				O: null,
				P: null,
				Q: null,
				R: null
			};
		}
	}
	calculate_verts() {
		if (this.tile_type === 0) {
			this.add_vert([0], ...this.hex_vert_coord([0, 1], 5));
			this.add_vert([1], ...this.hex_vert_coord([1, 0], 2));
		} else {
			this.add_vert([2], ...this.hex_vert_coord([1, 1], 3));
			this.add_vert([3], ...this.hex_vert_coord([1, 1], 4));
			this.add_vert([4], ...this.hex_vert_coord([0, 0], 1));
			this.add_vert([5], ...this.hex_vert_coord([0, 0], 0));
		}
	}
	calculate_faces() {
		if (this.tile_type === 0) {
			this.add_face(
				"A",
				[
					0,
					top_tile(5),
					top_tile(4),
					top_left_tile(1),
					left_tile(2),
					left_tile(3)
				],
				{ equivalent: [top_tile("T"), top_left_tile("H"), left_tile("I")] }
			);
			this.add_face(
				"B",
				[0, right_tile(2), top_tile(5)],
				{ equivalent: [top_tile("S"), right_tile("K")] }
			);
			this.add_face(
				"C",
				[0, right_tile(4), right_tile(2)],
				{ equivalent: [right_tile("L")] }
			);
			this.add_face(
				"D",
				[0, 1, right_tile(4)],
				{ equivalent: [right_tile("M")] }
			);
			this.add_face(
				"E",
				[1, 0, left_tile(3)],
				{ equivalent: [left_tile("P")] }
			);
			this.add_face(
				"F",
				[1, left_tile(3), left_tile(5)],
				{ equivalent: [left_tile("Q")] }
			);
			this.add_face(
				"G",
				[1, left_tile(5), bottom_tile(2)],
				{ equivalent: [left_tile("R")] }
			);
		} else {
			this.add_face("N", [2, 4, 3]);
			this.add_face("O", [3, 4, 5]);
		}
	}
	color_pattern1() {
		if (this.tile_type === 0) {
			this.color_face("A", 2);
			this.color_face("B", 1);
			this.color_face("D", 1);
			this.color_face("F", 1);
		} else {
			this.color_face("N", 1);
		}
	}
}
class BigHexTriTessagon extends Tessagon {
	static tile_class = BigHexTriTile;
	//static metadata = big_hex_tri_metadata;
	static metadata = new TessagonMetadata({
		name: "Big Hexagons and Triangles",
		num_color_patterns: 1,
		classification: "archimedean",
		shapes: ["hexagons", "triangles"],
		sides: [6, 3],
		uv_ratio: 1.0 / Math.sqrt(3),
		extra_parameters: {
			hexagon_ratio: {
				type: "float",
				min: 0.0,
				max: 0.70,
				default: 0.5,
				description: "Control the size of the Hexagons"
			}
		}
	});
}

const brick_metadata = new TessagonMetadata({
	name: "Bricks",
	num_color_patterns: 1,
	classification: "non_edge",
	shapes: ["rectangles"],
	sides: [4],
	uv_ratio: 1.0
});
class BrickTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: { top: null, middle: null, bottom: null },
			right: { top: null, middle: null, bottom: null }
		};
	}
	init_faces() {
		return {
			left: null,
			right: null,
			top: null,
			bottom: null
		};
	}
	calculate_verts() {
		// corners: set bottom-left ... symmetry takes care of other 3 corners
		this.add_vert(["left", "bottom"], 0.25, 0.0, { v_boundary: true });
		// left middle, symmetry also creates right middle
		this.add_vert(["left", "middle"], 0.25, 0.5);
	}
	calculate_faces() {
		// Add left, symmetry gives the right side face
		this.add_face(
			"left",
			[
				["left", "top"],
				["left", "middle"],
				["left", "bottom"],
				left_tile(["right", "bottom"]),
				left_tile(["right", "middle"]),
				left_tile(["right", "top"])
			],
			{ u_boundary: true }
		);
		// Add bottom, symmetry gives the top face
		this.add_face(
			"bottom",
			[
				["right", "bottom"],
				["right", "middle"],
				["left", "middle"],
				["left", "bottom"],
				bottom_tile(["left", "middle"]),
				bottom_tile(["right", "middle"])
			],
			{ v_boundary: true }
		);
	}
	color_pattern1() {
		this.color_paths([["left"], ["right"]], 1, 0);
	}
}
class BrickTessagon extends Tessagon {
	static tile_class = BrickTile;
	static metadata = brick_metadata;
}


const cloverdale_metadata = new TessagonMetadata({
	name: "Cloverdale",
	num_color_patterns: 1,
	classification: "non_edge",
	shapes: ["squares", "pentagons"],
	sides: [4, 5],
	uv_ratio: 1.0
});
class CloverdaleTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: { inner: null, outer: null, u_border: null, v_border: null },
				middle: { inner: null, outer: null },
				bottom: { inner: null, outer: null, u_border: null, v_border: null }
			},
			center: {
				top: { inner: null, outer: null },
				middle: null,
				bottom: { inner: null, outer: null }
			},
			right: {
				top: { inner: null, outer: null, u_border: null, v_border: null },
				middle: { inner: null, outer: null },
				bottom: { inner: null, outer: null, u_border: null, v_border: null }
			}
		};
	}
	init_faces() {
		return {
			left: {
				top: { square: null, u_pentagon: null, v_pentagon: null },
				bottom: { square: null, u_pentagon: null, v_pentagon: null },
				middle: { square: null }
			},
			center: {
				top: { square: null },
				bottom: { square: null }
			},
			right: {
				top: { square: null, u_pentagon: null, v_pentagon: null },
				bottom: { square: null, u_pentagon: null, v_pentagon: null },
				middle: { square: null }
			}
		};
	}
	calculate_verts() {
		// a is the side length of square, c is half diagonal of square
		const c = 1.0 / (Math.sqrt(2.0) + 4.0);
		const a = Math.sqrt(2.0) * c;
		// left top corner
		this.add_vert(["left", "top", "inner"], a / 2.0 + c, 1.0 - (a / 2.0 + c));
		this.add_vert(["left", "top", "outer"], a / 2.0, 1.0 - a / 2.0);
		this.add_vert(["left", "top", "u_border"], 0.0, 1.0 - a / 2.0, { u_boundary: true });
		this.add_vert(["left", "top", "v_border"], a / 2.0, 1.0, { v_boundary: true });
		this.add_vert(["left", "middle", "inner"], a / 2.0, 0.5);
		this.add_vert(["left", "middle", "outer"], 0.0, 0.5, { u_boundary: true });
		this.add_vert(["center", "top", "inner"], 0.5, 1.0 - a / 2.0);
		this.add_vert(["center", "top", "outer"], 0.5, 1.0, { v_boundary: true });
		this.add_vert(["center", "middle"], 0.5, 0.5);
	}
	calculate_faces() {
		// Middle star face
		this.add_face(
			["left", "top", "square"],
			[
				["left", "top", "v_border"],
				["left", "top", "outer"],
				["left", "top", "u_border"],
				left_tile(["right", "top", "outer"]),
				left_tile(["right", "top", "v_border"]),
				top_left_tile(["right", "bottom", "outer"]),
				top_tile(["left", "bottom", "u_border"]),
				top_tile(["left", "bottom", "outer"])
			],
			{ face_type: "star", corner: true }
		);
		this.add_face(
			["left", "top", "u_pentagon"],
			[
				["left", "top", "u_border"],
				["left", "top", "outer"],
				["left", "top", "inner"],
				["left", "middle", "inner"],
				["left", "middle", "outer"]
			]
		);
		this.add_face(
			["left", "top", "v_pentagon"],
			[
				["left", "top", "v_border"],
				["center", "top", "outer"],
				["center", "top", "inner"],
				["left", "top", "inner"],
				["left", "top", "outer"]
			]
		);
		this.add_face(
			["center", "top", "square"],
			[
				["center", "middle"],
				["left", "top", "inner"],
				["center", "top", "inner"],
				["right", "top", "inner"]
			]
		);
		this.add_face(
			["left", "middle", "square"],
			[
				["center", "middle"],
				["left", "bottom", "inner"],
				["left", "middle", "inner"],
				["left", "top", "inner"]
			]
		);
	}
	color_pattern1() {
		this.color_face(["left", "top", "square"], 1);
		this.color_face(["left", "middle", "square"], 1);
		this.color_face(["center", "top", "square"], 1);
		this.color_face(["right", "middle", "square"], 1);
		this.color_face(["center", "bottom", "square"], 1);
		this.color_face(["left", "top", "u_pentagon"], 0);
		this.color_face(["left", "top", "v_pentagon"], 0);
	}
}
class CloverdaleTessagon extends Tessagon {
	static tile_class = CloverdaleTile;
	static metadata = cloverdale_metadata;
}

const dissected_hex_quad_metadata = new TessagonMetadata({
	name: "Hexagons Dissected with Quads",
	num_color_patterns: 2,
	classification: "laves",
	shapes: ["quads"],
	sides: [4],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class DissectedHexQuadTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: { corner: null, interior: null, u_boundary: null },
				middle: null,
				bottom: { corner: null, interior: null, u_boundary: null }
			},
			right: {
				top: { corner: null, interior: null, u_boundary: null },
				middle: null,
				bottom: { corner: null, interior: null, u_boundary: null }
			},
			center: {
				middle: null,
				top: { v_boundary: null, interior: null },
				bottom: { v_boundary: null, interior: null }
			}
		};
	}
	init_faces() {
		return {
			left: {
				top: { v_boundary: null, u_boundary: null, middle: null },
				bottom: { v_boundary: null, u_boundary: null, middle: null }
			},
			right: {
				top: { v_boundary: null, u_boundary: null, middle: null },
				bottom: { v_boundary: null, u_boundary: null, middle: null }
			},
			center: { top: null, bottom: null }
		};
	}
	calculate_verts() {
		this.add_vert(["left", "top", "corner"], 0, 1, { corner: true });
		this.add_vert(["left", "top", "interior"], 0.25, 0.75);
		this.add_vert(["left", "top", "u_boundary"], 0, 2.0 / 3.0, { u_boundary: true });
		this.add_vert(["left", "middle"], 0, 0.5, { u_boundary: true });
		this.add_vert(["center", "middle"], 0.5, 0.5);
		this.add_vert(["center", "top", "v_boundary"], 0.5, 1.0, { v_boundary: true });
		this.add_vert(["center", "top", "interior"], 0.5, 5.0 / 6.0);
	}
	calculate_faces() {
		this.add_face(
			["left", "top", "v_boundary"],
			[
				["left", "top", "corner"],
				["center", "top", "v_boundary"],
				["center", "top", "interior"],
				["left", "top", "interior"]
			]
		);
		this.add_face(
			["left", "top", "u_boundary"],
			[
				["left", "top", "corner"],
				["left", "top", "interior"],
				["left", "top", "u_boundary"],
				left_tile(["right", "top", "interior"])
			],
			{ u_boundary: true }
		);
		this.add_face(
			["left", "top", "middle"],
			[
				["left", "top", "interior"],
				["center", "middle"],
				["left", "middle"],
				["left", "top", "u_boundary"]
			]
		);
		this.add_face(
			["center", "top"],
			[
				["center", "middle"],
				["left", "top", "interior"],
				["center", "top", "interior"],
				["right", "top", "interior"]
			]
		);
	}
	color_pattern1() {
		this.color_paths(
			[
				["left", "top", "middle"],
				["center", "top"],
				["right", "top", "middle"],
				["left", "bottom", "middle"],
				["center", "bottom"],
				["right", "bottom", "middle"]
			],
			1,
			0
		);
	}
	color_pattern2() {
		if (this.fingerprint[0] % 3 === 0) {
			this.color_paths(
				[
					["left", "top", "middle"],
					["center", "top"],
					["right", "top", "middle"],
					["left", "bottom", "middle"],
					["center", "bottom"],
					["right", "bottom", "middle"]
				],
				1,
				0
			);
		} else if (this.fingerprint[0] % 3 === 1) {
			this.color_paths(
				[
					["right", "top", "v_boundary"],
					["right", "bottom", "v_boundary"]
				],
				1,
				0
			);
		} else if (this.fingerprint[0] % 3 === 2) {
			this.color_paths(
				[
					["left", "top", "v_boundary"],
					["left", "top", "u_boundary"],
					["left", "bottom", "v_boundary"],
					["left", "bottom", "u_boundary"]
				],
				1,
				0
			);
		}
	}
}
class DissectedHexQuadTessagon extends Tessagon {
	static tile_class = DissectedHexQuadTile;
	static metadata = dissected_hex_quad_metadata;
}

const dissected_hex_tri_metadata = new TessagonMetadata({
	name: "Hexagons Dissected with Triangles",
	num_color_patterns: 1,
	classification: "laves",
	shapes: ["triangles"],
	sides: [3],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class DissectedHexTriTile extends DissectedHexQuadTile {
	init_faces() {
		return {
			left: {
				top: {
					v_boundary: null,
					u_boundary: null,
					middle: null,
					center: null,
					interior1: null,  // Touches corner
					interior2: null
				},
				bottom: {
					v_boundary: null,
					u_boundary: null,
					middle: null,
					center: null,
					interior1: null,
					interior2: null
				}
			},
			right: {
				top: {
					v_boundary: null,
					u_boundary: null,
					middle: null,
					center: null,
					interior1: null,
					interior2: null
				},
				bottom: {
					v_boundary: null,
					u_boundary: null,
					middle: null,
					center: null,
					interior1: null,
					interior2: null
				}
			}
		};
	}
	calculate_faces() {
		this.add_face(
			["left", "top", "v_boundary"],
			[
				["left", "top", "corner"],
				["center", "top", "v_boundary"],
				["center", "top", "interior"]
			]
		);
		this.add_face(
			["left", "top", "interior1"],
			[
				["left", "top", "corner"],
				["center", "top", "interior"],
				["left", "top", "interior"]
			]
		);
		this.add_face(
			["left", "top", "u_boundary"],
			[
				["left", "top", "corner"],
				["left", "top", "interior"],
				["left", "top", "u_boundary"]
			]
		);
		this.add_face(
			["left", "top", "middle"],
			[
				["center", "middle"],
				["left", "middle"],
				["left", "top", "u_boundary"]
			]
		);
		this.add_face(
			["left", "top", "interior2"],
			[
				["left", "top", "interior"],
				["center", "middle"],
				["left", "top", "u_boundary"]
			]
		);
		this.add_face(
			["left", "top", "center"],
			[
				["center", "middle"],
				["left", "top", "interior"],
				["center", "top", "interior"]
			]
		);
	}
	color_pattern1() {
		this.color_paths(
			[
				["left", "top", "v_boundary"],
				["left", "top", "u_boundary"],
				["left", "top", "middle"],
				["left", "top", "center"],
				["right", "top", "interior1"],
				["right", "top", "interior2"],
				["right", "bottom", "v_boundary"],
				["right", "bottom", "u_boundary"],
				["right", "bottom", "middle"],
				["right", "bottom", "center"],
				["left", "bottom", "interior1"],
				["left", "bottom", "interior2"]
			],
			1,
			0
		);
	}
}
class DissectedHexTriTessagon extends Tessagon {
	static tile_class = DissectedHexTriTile;
	static metadata = dissected_hex_tri_metadata;
}


const dissected_suqare_metadata = new TessagonMetadata({
	name: "Dissected Square",
	num_color_patterns: 2,
	classification: "laves",
	shapes: ["triangles"],
	sides: [3],
	uv_ratio: 1.0
});
class DissectedSquareTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			top: { left: null, center: null, right: null },
			middle: { left: null, center: null, right: null },
			bottom: { left: null, center: null, right: null }
		};
	}
	init_faces() {
		return {
			top: {
				left: { middle: null, center: null },
				right: { middle: null, center: null }
			},
			bottom: {
				left: { middle: null, center: null },
				right: { middle: null, center: null }
			}
		};
	}
	calculate_verts() {
		this.add_vert(["top", "left"], 0, 1.0, { corner: true });
		this.add_vert(["middle", "left"], 0, 0.5, { u_boundary: true });
		this.add_vert(["top", "center"], 0.5, 1.0, { v_boundary: true });
		this.add_vert(["middle", "center"], 0.5, 0.5);
	}
	calculate_faces() {
		this.add_face(
			["top", "left", "middle"],
			[
				["top", "left"],
				["middle", "left"],
				["middle", "center"]
			]
		);
		this.add_face(
			["top", "left", "center"],
			[
				["top", "left"],
				["middle", "center"],
				["top", "center"]
			]
		);
	}
	color_pattern1() {
		this.color_paths(
			[
				["top", "left", "center"],
				["top", "right", "middle"],
				["bottom", "right", "center"],
				["bottom", "left", "middle"]
			],
			1,
			0
		);
	}
	color_pattern2() {
		if ((Math.floor(this.fingerprint[0] / 2) + Math.floor(this.fingerprint[1] / 2)) % 2 === 0) {
			this.color_tiles(1, 0);
		} else {
			this.color_tiles(0, 1);
		}
	}
	color_tiles(color1, color2) {
		if (this.fingerprint[0] % 2 === 0) {
			if (this.fingerprint[1] % 2 === 0) {
				this.color_paths(
					[
						["top", "left", "center"],
						["bottom", "right", "middle"]
					],
					color2,
					color1
				);
			} else {
				this.color_paths(
					[
						["bottom", "left", "center"],
						["top", "right", "middle"]
					],
					color2,
					color1
				);
			}
		} else {
			if (this.fingerprint[1] % 2 === 0) {
				this.color_paths(
					[
						["top", "right", "center"],
						["bottom", "left", "middle"]
					],
					color2,
					color1
				);
			} else {
				this.color_paths(
					[
						["bottom", "right", "center"],
						["top", "left", "middle"]
					],
					color2,
					color1
				);
			}
		}
	}
}
class DissectedSquareTessagon extends Tessagon {
	static tile_class = DissectedSquareTile;
	static metadata = dissected_suqare_metadata;
}


const dissectedt_triangle_metadata = new TessagonMetadata({
	name: "Dissected Triangle",
	num_color_patterns: 1,
	classification: "laves",
	shapes: ["triangles"],
	sides: [3],
	uv_ratio: Math.sqrt(3.0)
});
class DissectedTriangleTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: { corner: null, v_boundary: null },
				middle: null,
				bottom: { corner: null, v_boundary: null }
			},
			right: {
				top: { corner: null, v_boundary: null },
				middle: null,
				bottom: { corner: null, v_boundary: null }
			},
			center: null
		};
	}
	init_faces() {
		return {
			left: {
				top: { center: null, interior1: null, interior2: null },
				middle: null,
				bottom: { center: null, interior1: null, interior2: null }
			},
			right: {
				top: { center: null, interior1: null, interior2: null },
				middle: null,
				bottom: { center: null, interior1: null, interior2: null }
			}
		};
	}
	calculate_verts() {
		this.add_vert(["left", "top", "corner"], 0, 1, { corner: true });
		this.add_vert("center", 0.5, 0.5);
		this.add_vert(["left", "top", "v_boundary"], 1.0 / 3.0, 1, { v_boundary: true });
		this.add_vert(["left", "middle"], 1.0 / 6.0, 0.5);
	}
	calculate_faces() {
		this.add_face(
			["left", "middle"],
			[
				["left", "middle"],
				["left", "top", "corner"],
				["left", "bottom", "corner"]
			]
		);
		this.add_face(
			["left", "top", "center"],
			[
				["center"],
				["left", "top", "v_boundary"],
				top_tile(["center"])
			],
			{ v_boundary: true }
		);
		this.add_face(
			["left", "top", "interior1"],
			[
				["center"],
				["left", "top", "v_boundary"],
				["left", "top", "corner"]
			]
		);
		this.add_face(
			["left", "top", "interior2"],
			[
				["center"],
				["left", "middle"],
				["left", "top", "corner"]
			]
		);
	}
	color_pattern1() {
		if (this.fingerprint[1] % 3 === 0) {
			this.color_paths(
				[
					["left", "middle"],
					["right", "middle"]
				],
				1,
				0
			);
		} else if (this.fingerprint[1] % 3 === 2) {
			this.color_paths(
				[
					["left", "top", "interior2"],
					["right", "top", "interior2"],
					["left", "top", "interior1"],
					["right", "top", "interior1"]
				],
				1,
				0
			);
			this.color_paths(
				[
					["left", "bottom", "center"],
					["right", "bottom", "center"]
				],
				1,
				0
			);
		} else {
			this.color_paths(
				[
					["left", "bottom", "interior2"],
					["right", "bottom", "interior2"],
					["left", "bottom", "interior1"],
					["right", "bottom", "interior1"]
				],
				1,
				0
			);
		}
	}
}
class DissectedTriangleTessagon extends Tessagon {
	static tile_class = DissectedTriangleTile;
	static metadata = dissectedt_triangle_metadata;
}


const dodeca_metadata = new TessagonMetadata({
	name: "Dodecagons, Hexagons, and Squares",
	num_color_patterns: 1,
	classification: "archimedean",
	shapes: ["dodecagons", "hexagons", "squares"],
	sides: [12, 6, 4],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class DodecaTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			top: {
				left: {
					u_square: null,
					v_square: null,
					sq1: null,
					sq2: null,
					sq3: null,
					sq4: null
				},
				right: {
					u_square: null,
					v_square: null,
					sq1: null,
					sq2: null,
					sq3: null,
					sq4: null
				}
			},
			bottom: {
				left: {
					u_square: null,
					v_square: null,
					sq1: null,
					sq2: null,
					sq3: null,
					sq4: null
				},
				right: {
					u_square: null,
					v_square: null,
					sq1: null,
					sq2: null,
					sq3: null,
					sq4: null
				}
			}
		};
	}
	init_faces() {
		return {
			dodec: {
				top: { left: null, right: null },
				bottom: { left: null, right: null },
				middle: null
			},
			hex: {
				top: { left: null, center: null, right: null },
				bottom: { left: null, center: null, right: null }
			},
			square: {
				top: { left: null, center: null, right: null },
				bottom: { left: null, center: null, right: null },
				middle: { left: null, right: null }
			}
		};
	}
	calculate_verts() {
		// u_unit: edge length as a proportion of the tile
		const u_unit = 1.0 / (3.0 + Math.sqrt(3));
		const u_h = 0.5 * Math.sqrt(3) * u_unit; // height of triangle with side u_unit
		const u1 = 0.5 * u_unit;
		const u2 = 0.5 - u1 - u_h;
		const u3 = 0.5 - u_unit;
		const u4 = 0.5 - u1;
		const v_unit = 1.0 / (3.0 * (1.0 + Math.sqrt(3)));
		const v_h = 0.5 * Math.sqrt(3) * v_unit; // height of triangle with side v_unit
		const v1 = 1.0 - 0.5 * v_unit;
		const v2 = v1 - v_h;
		const v3 = 0.5 + 2 * v_h + 0.5 * v_unit;
		const v4 = 0.5 + v_h + v_unit;
		const v5 = 0.5 + v_h + 0.5 * v_unit;
		const v6 = 0.5 + 0.5 * v_unit;
		// Define top left region (other vertices defined via symmetry)
		this.add_vert(["top", "left", "v_square"], u4, v1);
		this.add_vert(["top", "left", "u_square"], u1, v6);
		this.add_vert(["top", "left", "sq1"], u2, v5);
		this.add_vert(["top", "left", "sq2"], u4, v4);
		this.add_vert(["top", "left", "sq3"], u1, v3);
		this.add_vert(["top", "left", "sq4"], u3, v2);
	}
	calculate_faces() {
		// Top left Dodecagon
		this.add_face(
			["dodec", "top", "left"],
			[
				["top", "left", "v_square"],
				["top", "left", "sq4"],
				["top", "left", "sq3"],
				left_tile(["top", "right", "sq3"]),
				left_tile(["top", "right", "sq4"]),
				left_tile(["top", "right", "v_square"]),
				left_top_tile(["bottom", "right", "v_square"]),
				left_top_tile(["bottom", "right", "sq4"]),
				left_top_tile(["bottom", "right", "sq3"]),
				top_tile(["bottom", "left", "sq3"]),
				top_tile(["bottom", "left", "sq4"]),
				top_tile(["bottom", "left", "v_square"])
			],
			{ face_type: 'dodecagon', corner: true }
		);
		// Middle Dodecagon
		this.add_face(
			["dodec", "middle"],
			[
				["top", "left", "u_square"],
				["top", "left", "sq1"],
				["top", "left", "sq2"],
				["top", "right", "sq2"],
				["top", "right", "sq1"],
				["top", "right", "u_square"],
				["bottom", "right", "u_square"],
				["bottom", "right", "sq1"],
				["bottom", "right", "sq2"],
				["bottom", "left", "sq2"],
				["bottom", "left", "sq1"],
				["bottom", "left", "u_square"]
			],
			{ face_type: 'dodecagon' }
		);
		// Upper square
		this.add_face(
			["square", "top", "center"],
			[
				["top", "left", "v_square"],
				["top", "right", "v_square"],
				top_tile(["bottom", "right", "v_square"]),
				top_tile(["bottom", "left", "v_square"])
			],
			{ face_type: 'square', v_boundary: true }
		);
		// Left square
		this.add_face(
			["square", "middle", "left"],
			[
				["top", "left", "u_square"],
				["bottom", "left", "u_square"],
				left_tile(["bottom", "right", "u_square"]),
				left_tile(["top", "right", "u_square"])
			],
			{ face_type: 'square', u_boundary: true }
		);
		// Interior square
		this.add_face(
			["square", "top", "left"],
			[
				["top", "left", "sq1"],
				["top", "left", "sq2"],
				["top", "left", "sq4"],
				["top", "left", "sq3"]
			],
			{ face_type: 'square' }
		);
		// Top Hex
		this.add_face(
			["hex", "top", "center"],
			[
				["top", "left", "sq2"],
				["top", "left", "sq4"],
				["top", "left", "v_square"],
				["top", "right", "v_square"],
				["top", "right", "sq4"],
				["top", "right", "sq2"]
			],
			{ face_type: 'hexagon' }
		);
		// Left Hex
		this.add_face(
			["hex", "top", "left"],
			[
				["top", "left", "sq3"],
				["top", "left", "sq1"],
				["top", "left", "u_square"],
				left_tile(["top", "right", "u_square"]),
				left_tile(["top", "right", "sq1"]),
				left_tile(["top", "right", "sq3"])
			],
			{ face_type: 'hexagon', u_boundary: true }
		);
	}
	color_pattern1() {
		this.color_face(["dodec", "middle"], 1);
		this.color_face(["dodec", "top", "left"], 1);
		this.color_face(["hex", "top", "left"], 2);
		this.color_face(["hex", "top", "center"], 2);
		this.color_face(["hex", "bottom", "left"], 2);
		this.color_face(["hex", "bottom", "center"], 2);
	}
}
class DodecaTessagon extends Tessagon {
	static tile_class = DodecaTile;
	static metadata = dodeca_metadata;
}


const dodeca_tri_metadata = new TessagonMetadata({
	name: "Dodecagons and Triangles",
	num_color_patterns: 1,
	classification: "archimedean",
	shapes: ["dodecagons", "triangles"],
	sides: [12, 3],
	uv_ratio: Math.sqrt(3.0)
});
class DodecaTriTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: { v_boundary: null, diag: null, tri: null },
				middle: null,
				bottom: { v_boundary: null, diag: null, tri: null }
			},
			right: {
				top: { v_boundary: null, diag: null, tri: null },
				middle: null,
				bottom: { v_boundary: null, diag: null, tri: null }
			}
		};
	}
	init_faces() {
		return {
			dodec: {
				left: { top: null, bottom: null },
				right: { top: null, bottom: null },
				center: null
			},
			tri: {
				left: { top: null, middle: null, bottom: null },
				right: { top: null, middle: null, bottom: null }
			}
		};
	}
	calculate_verts() {
		const u_unit = 1.0 / (3.0 + 2.0 * Math.sqrt(3));
		const u_h = 0.5 * Math.sqrt(3) * u_unit; // height of triangle of side u_unit
		const u1 = 0.5 * u_unit;
		const u2 = u1 + u_h;
		const u3 = u2 + u1;
		const u4 = u3 + u_h;
		const v_unit = 1.0 / (2.0 + Math.sqrt(3));
		const v_h = 0.5 * Math.sqrt(3) * v_unit; // height of triangle of side v_unit
		const v1 = 0;
		const v2 = 0.5 * v_unit;
		const v3 = v2 + v_h;
		const v4 = 0.5;
		// Sweet symmetry makes this easy work
		this.add_vert(["left", "middle"], u1, v4);
		this.add_vert(["left", "bottom", "v_boundary"], u4, v1, { v_boundary: true });
		this.add_vert(["left", "bottom", "diag"], u3, v2);
		this.add_vert(["left", "bottom", "tri"], u2, v3);
	}
	calculate_faces() {
		// Top left Dodecagon
		this.add_face(
			["dodec", "left", "bottom"],
			[
				["left", "middle"],
				["left", "bottom", "tri"],
				["left", "bottom", "diag"],
				bottom_tile(["left", "top", "diag"]),
				bottom_tile(["left", "top", "tri"]),
				bottom_tile(["left", "middle"]),
				bottom_left_tile(["right", "middle"]),
				bottom_left_tile(["right", "top", "tri"]),
				bottom_left_tile(["right", "top", "diag"]),
				left_tile(["right", "bottom", "diag"]),
				left_tile(["right", "bottom", "tri"]),
				left_tile(["right", "middle"])
			],
			{ face_type: "dodecagon", corner: true }
		);
		// Middle Dodecagon
		this.add_face(
			["dodec", "center"],
			[
				["left", "bottom", "tri"],
				["left", "bottom", "diag"],
				["left", "bottom", "v_boundary"],
				["right", "bottom", "v_boundary"],
				["right", "bottom", "diag"],
				["right", "bottom", "tri"],
				["right", "top", "tri"],
				["right", "top", "diag"],
				["right", "top", "v_boundary"],
				["left", "top", "v_boundary"],
				["left", "top", "diag"],
				["left", "top", "tri"]
			],
			{ face_type: "dodecagon" }
		);
		// Left triangle
		this.add_face(
			["tri", "left", "middle"],
			[
				["left", "top", "tri"],
				["left", "bottom", "tri"],
				["left", "middle"]
			],
			{ face_type: "triangle" }
		);
		// Bottom-left triangle
		this.add_face(
			["tri", "left", "bottom"],
			[
				["left", "bottom", "diag"],
				["left", "bottom", "v_boundary"],
				bottom_tile(["left", "top", "diag"])
			],
			{ face_type: "triangle", v_boundary: true }
		);
	}
	color_pattern1() {
		this.color_paths([["dodec", "left", "bottom"], ["dodec", "center"]], 1, 0);
	}
}
class DodecaTriTessagon extends Tessagon {
	static tile_class = DodecaTriTile;
	static metadata = dodeca_tri_metadata;
}


const floret_metadata = new TessagonMetadata({
	name: "Florets",
	num_color_patterns: 3,
	classification: "laves",
	shapes: ["pentagons"],
	sides: [5],
	uv_ratio: 1.0 / Math.sqrt(3)
});
class FloretTile extends AlternatingTile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = false;
		this.v_symmetric = false;
		this.uv_ratio = FloretTessagon.metadata.uv_ratio;
		const theta_offset1 = Math.PI / 3 - Math.atan2(Math.sqrt(3), 9);
		const theta_offset2 = Math.PI / 6;
		this.hexagons = [
			{
				radius: 4 / Math.sqrt(21),
				hex_theta: Array.from({ length: 6 }, (_, number) => theta_offset1 + number * Math.PI / 3)
			},
			{
				radius: 2 / (3 * this.uv_ratio),
				hex_theta: Array.from({ length: 6 }, (_, number) => theta_offset2 + number * Math.PI / 3)
			}
		];
	}
	hex_vert_coord(hexagon_num, center, number) {
		const hexagon = this.hexagons[hexagon_num];
		return [
			center[0] + hexagon.radius * Math.cos(hexagon.hex_theta[number]),
			center[1] + hexagon.radius * Math.sin(hexagon.hex_theta[number]) * this.uv_ratio
		];
	}
	init_verts() {
		let verts = {};
		if (this.tile_type === 0) {
			for (let i = 0; i < 6; i++) {
				verts[i] = null;
			}
		} else {
			for (let i = 6; i < 14; i++) {
				verts[i] = null;
			}
		}
		return verts;
	}
	init_faces() {
		let faces = {};
		if (this.tile_type === 0) {
			for (const c of ['A', 'B', 'C', 'D']) {
				faces[c] = null;
			}
		} else {
			for (const c of ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']) {
				faces[c] = null;
			}
		}
		return faces;
	}
	calculate_verts() {
		if (this.tile_type === 0) {
			this.add_vert([2], ...this.hex_vert_coord(0, [0, 0], 0));
			this.add_vert([3], ...this.hex_vert_coord(0, [1, 1], 3));
		} else {
			this.add_vert([6], 1, 0, { equivalent: [right_tile(0), bottom_right_tile(13), bottom_tile(5)] });
			this.add_vert([7], ...this.hex_vert_coord(0, [1, 0], 2));
			this.add_vert([8], ...this.hex_vert_coord(1, [0, 1], 4), { equivalent: [left_tile(1)] });
			this.add_vert([9], ...this.hex_vert_coord(0, [0, 1], 4));
			this.add_vert([10], ...this.hex_vert_coord(0, [1, 0], 1));
			this.add_vert([11], ...this.hex_vert_coord(1, [0, 1], 5), { equivalent: [right_tile(4)] });
			this.add_vert([12], ...this.hex_vert_coord(0, [0, 1], 5));
			this.add_vert([13], 0, 1, { equivalent: [left_tile(5), top_left_tile(6), top_tile(0)] });
		}
	}
	calculate_faces() {
		if (this.tile_type === 0) {
			return;
		}
		this.add_face('G', [6, 10, 9, 8, 7]);
		this.add_face('H', [11, 10, 6, right_tile(2), right_tile(3)], { equivalent: [right_tile('B')] });
		this.add_face('I', [8, 9, 13, left_tile(3), left_tile(2)], { equivalent: [left_tile('C')] });
		this.add_face('J', [13, 9, 10, 11, 12]);
		this.add_face('K', [12, 11, right_tile(3), right_tile(5), top_right_tile(7)], { equivalent: [right_tile('D'), top_right_tile('E')] });
		this.add_face('L', [13, 12, top_right_tile(7), top_tile(1), top_tile(2)], { equivalent: [top_right_tile('F'), top_tile('A')] });
	}
	floret_fingerprint(face) {
		let fingerprint = [...this.fingerprint];
		fingerprint[0] = Math.floor(fingerprint[0] / 2) + Math.floor(fingerprint[1] / 2);
		if (face === 'F') {
			fingerprint[0] -= 1;
		} else if (face === 'K') {
			fingerprint[0] += 1;
		}
		if (this.fingerprint[0] % 2 === 0) {
			if (['A', 'B'].includes(face)) {
				fingerprint[0] -= 1;
			}
		} else {
			if (['C', 'D'].includes(face)) {
				fingerprint[0] += 1;
			}
		}
		if (['A', 'B', 'E', 'F', 'G', 'H'].includes(face)) {
			fingerprint[1] -= 1;
		}
		return fingerprint;
	}
	color_pattern1() {
		const pattern = [0, 0, 1];
		for (const face in this.faces) {
			const fp = this.floret_fingerprint(face);
			const offset = (fp[0] + fp[1]) % 3;
			this.color_face(face, pattern[offset]);
		}
	}
	color_pattern2() {
		for (const face in this.faces) {
			const fp = this.floret_fingerprint(face);
			const color = (fp[0] + fp[1]) % 3;
			this.color_face(face, color);
		}
	}
	color_pattern3() {
		const pattern = [
			[2, 0, 2, 2, 0, 2],
			[2, 1, 2, 0, 0, 0]
		];
		for (const face in this.faces) {
			const fp = this.floret_fingerprint(face);
			const row = fp[1] % 2;
			const column = ((fp[0] - 2 * fp[1]) % 6 + 6) % 6; // ensure non-negative modulo
			this.color_face(face, pattern[row][column]);
		}
	}
}
class FloretTessagon extends Tessagon {
	static tile_class = FloretTile;
	static metadata = floret_metadata;
}


const hex_big_tri_metadata = new TessagonMetadata({
	name: "Hexagons and Big Triangles",
	num_color_patterns: 2,
	classification: "non_edge",
	shapes: ["hexagons", "triangles"],
	sides: [6, 3],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class HexBigTriTile extends AlternatingTile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = false;
		this.v_symmetric = false;
		this.hexagon_ratio = 0.5;
		this.hex_radius = 4 * this.hexagon_ratio / Math.sqrt(7);
		this.uv_ratio = HexBigTriTessagon.metadata.uv_ratio;
		this.theta_offset = -Math.atan2(1, 3 * Math.sqrt(3)) + Math.PI / 6;
		this.hex_theta = Array.from({ length: 6 }, (_, number) => this.theta_offset + number * Math.PI / 3);
	}
	hex_vert_coord(center, number) {
		return [
			center[0] + this.hex_radius * Math.cos(this.hex_theta[number]),
			center[1] + this.hex_radius * Math.sin(this.hex_theta[number]) * this.uv_ratio
		];
	}
	init_verts() {
		if (this.tile_type === 0) {
			return { 0: null, 1: null };
		} else {
			return { 2: null, 3: null, 4: null, 5: null };
		}
	}
	init_faces() {
		if (this.tile_type === 0) {
			return { A: null, B: null, C: null, D: null };
		} else {
			return { E: null, F: null, G: null, H: null, I: null, J: null };
		}
	}
	calculate_verts() {
		if (this.tile_type === 0) {
			this.add_vert([0], ...this.hex_vert_coord([0, 1], 5));
			this.add_vert([1], ...this.hex_vert_coord([1, 0], 2));
		} else {
			this.add_vert([2], ...this.hex_vert_coord([1, 1], 3));
			this.add_vert([3], ...this.hex_vert_coord([1, 1], 4));
			this.add_vert([4], ...this.hex_vert_coord([0, 0], 1));
			this.add_vert([5], ...this.hex_vert_coord([0, 0], 0));
		}
	}
	calculate_faces() {
		if (this.tile_type !== 0) {
			return;
		}
		// Top Hexagon
		this.add_face(
			'A',
			[
				0,
				left_tile(3),
				left_tile(2),
				top_left_tile(1),
				top_tile(4),
				top_tile(5)
			],
			{ equivalent: [left_tile('F'), top_left_tile('D'), top_tile('I')] }
		);
		// Left Triangle
		this.add_face(
			'B',
			[
				1,
				0,
				left_tile(3),
				left_tile(4),
				left_tile(5),
				bottom_tile(2)
			],
			{ equivalent: [bottom_tile('E'), left_tile('H')] }
		);
		// Right Triangle
		this.add_face(
			'C',
			[
				0,
				1,
				right_tile(4),
				right_tile(3),
				right_tile(2),
				top_tile(5)
			],
			{ equivalent: [right_tile('G'), top_tile('J')] }
		);
	}
	color_pattern1() {
		if (this.tile_type === 0) {
			this.color_face('A', 1);
		}
	}
	color_pattern2() {
		if (this.tile_type === 0) {
			this.color_face('A', 1);
			this.color_face('B', 2);
		}
	}
}
class HexBigTriTessagon extends Tessagon {
	static tile_class = HexBigTriTile;
	static metadata = hex_big_tri_metadata;
}


const hex_square_tri_metadata = new TessagonMetadata({
	name: "Hexagons, Squares, and Triangles",
	num_color_patterns: 1,
	classification: "archimedean",
	shapes: ["hexagons", "squares", "triangles"],
	sides: [6, 4, 3],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class HexSquareTriTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			top: {
				left: { u_boundary: null, u_square: null, v_square: null },
				right: { u_boundary: null, u_square: null, v_square: null },
				center: null
			},
			bottom: {
				left: { u_boundary: null, u_square: null, v_square: null },
				right: { u_boundary: null, u_square: null, v_square: null },
				center: null
			}
		};
	}
	init_faces() {
		return {
			hex: {
				top: { left: null, right: null },
				bottom: { left: null, right: null },
				middle: null
			},
			tri: {
				top: { left: null, center: null, right: null },
				bottom: { left: null, center: null, right: null }
			},
			square: {
				top: { left: null, center: null, right: null },
				bottom: { left: null, center: null, right: null },
				middle: { left: null, right: null }
			}
		};
	}
	calculate_verts() {
		const u_unit = 1.0 / (1.0 + Math.sqrt(3));
		const u0 = 0;
		const u1 = 0.5 * u_unit;
		const u2 = 0.5 * (1.0 - u_unit);
		const u3 = 0.5;
		const v_unit = 1.0 / (3.0 + Math.sqrt(3));
		const v0 = 1.0 - 0.5 * v_unit;
		const v1 = 1.0 - v_unit;
		const v2 = 0.5 + v_unit;
		const v3 = 0.5 + 0.5 * v_unit;
		// Define top left square, others defined through symmetry
		this.add_vert(["top", "left", "v_square"], u2, v0);
		this.add_vert(["top", "center"], u3, v2);
		this.add_vert(["top", "left", "u_square"], u1, v3);
		this.add_vert(["top", "left", "u_boundary"], u0, v1, { u_boundary: true });
	}
	calculate_faces() {
		// Middle hexagon
		this.add_face(
			["hex", "middle"],
			[
				["top", "center"],
				["top", "left", "u_square"],
				["bottom", "left", "u_square"],
				["bottom", "center"],
				["bottom", "right", "u_square"],
				["top", "right", "u_square"]
			],
			{ face_type: "hexagon" }
		);
		// Top square
		this.add_face(
			["square", "top", "center"],
			[
				["top", "left", "v_square"],
				["top", "right", "v_square"],
				top_tile(["bottom", "right", "v_square"]),
				top_tile(["bottom", "left", "v_square"])
			],
			{ face_type: "square", v_boundary: true }
		);
		// Left square
		this.add_face(
			["square", "middle", "left"],
			[
				["top", "left", "u_square"],
				["bottom", "left", "u_square"],
				left_tile(["bottom", "right", "u_square"]),
				left_tile(["top", "right", "u_square"])
			],
			{ face_type: "square", u_boundary: true }
		);
		// Interior square
		this.add_face(
			["square", "top", "left"],
			[
				["top", "left", "v_square"],
				["top", "center"],
				["top", "left", "u_square"],
				["top", "left", "u_boundary"]
			],
			{ face_type: "square" }
		);
		// Upper triangle
		this.add_face(
			["tri", "top", "center"],
			[
				["top", "center"],
				["top", "left", "v_square"],
				["top", "right", "v_square"]
			],
			{ face_type: "triangle" }
		);
		// Left triangle
		this.add_face(
			["tri", "top", "left"],
			[
				["top", "left", "u_square"],
				["top", "left", "u_boundary"],
				left_tile(["top", "right", "u_square"])
			],
			{ face_type: "triangle", u_boundary: true }
		);
		// Corner hexagon
		this.add_face(
			["hex", "top", "left"],
			[
				["top", "left", "v_square"],
				["top", "left", "u_boundary"],
				left_tile(["top", "right", "v_square"]),
				left_top_tile(["bottom", "right", "v_square"]),
				top_tile(["bottom", "left", "u_boundary"]),
				top_tile(["bottom", "left", "v_square"])
			],
			{ face_type: "hexagon", corner: true }
		);
	}
	color_pattern1() {
		this.color_face(["hex", "middle"], 1);
		this.color_face(["hex", "top", "left"], 1);
		this.color_face(["square", "top", "center"], 2);
		this.color_face(["square", "top", "left"], 2);
		this.color_face(["square", "top", "right"], 2);
		this.color_face(["square", "middle", "left"], 2);
		this.color_face(["square", "bottom", "left"], 2);
		this.color_face(["square", "bottom", "right"], 2);
	}
}
class HexSquareTriTessagon extends Tessagon {
	static tile_class = HexSquareTriTile;
	static metadata = hex_square_tri_metadata;
}

const hex_metadata = new TessagonMetadata({
	name: "Regular Hexagons",
	num_color_patterns: 2,
	classification: "regular",
	shapes: ["hexagons"],
	sides: [6],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class HexTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			top: { left: null, center: null, right: null },
			bottom: { left: null, center: null, right: null }
		};
	}
	init_faces() {
		return {
			top: { left: null, right: null },
			middle: null,
			bottom: { left: null, right: null }
		};
	}
	calculate_verts() {
		// Defines the vertex at ["top", "center"] and ["bottom", "center"]
		this.add_vert(["top", "center"], 0.5, 5.0 / 6.0);
		// Defines the vertices at ["top", "left"], ["bottom", "left"], and ["top", "right"]
		this.add_vert(["top", "left"], 0, 2.0 / 3.0, { u_boundary: true });
	}
	calculate_faces() {
		// Creates the middle face using six vertices
		this.add_face(
			"middle",
			[
				["top", "center"],
				["top", "left"],
				["bottom", "left"],
				["bottom", "center"],
				["bottom", "right"],
				["top", "right"]
			]
		);
		// Creates a corner face shared with neighboring tiles
		this.add_face(
			["top", "left"],
			[
				["top", "left"],
				["top", "center"],
				top_tile(["bottom", "center"]),
				top_tile(["bottom", "left"]),
				top_left_tile(["bottom", "center"]),
				left_tile(["top", "center"])
			],
			{ corner: true }
		);
	}
	color_pattern1() {
		if (this.fingerprint[0] % 3 === 0) {
			this.color_paths([["top", "left"], ["bottom", "left"]], 1, 0);
		} else if (this.fingerprint[0] % 3 === 1) {
			this.color_paths([["middle"]], 1, 0);
		} else {
			this.color_paths([["top", "right"], ["bottom", "right"]], 1, 0);
		}
	}
	color_pattern2() {
		if (this.fingerprint[0] % 3 === 0) {
			this.color_paths_hash(
				{
					1: [["top", "left"], ["bottom", "left"]],
					2: [["top", "right"], ["bottom", "right"]]
				},
				0
			);
		} else if (this.fingerprint[0] % 3 === 1) {
			this.color_paths_hash(
				{
					1: [["middle"]],
					2: [["top", "left"], ["bottom", "left"]]
				},
				0
			);
		} else {
			this.color_paths_hash(
				{
					2: [["middle"]],
					1: [["top", "right"], ["bottom", "right"]]
				},
				0
			);
		}
	}
}
class HexTessagon extends Tessagon {
	static tile_class = HexTile;
	static metadata = hex_metadata;
}


const hex_tri_metadata = new TessagonMetadata({
	name: "Hexagons and Triangles",
	num_color_patterns: 1,
	classification: "archimedean",
	shapes: ["hexagons", "triangles"],
	sides: [6, 3],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class HexTriTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			top: null,
			left: {
				top: null,
				middle: null,
				bottom: null
			},
			right: {
				top: null,
				middle: null,
				bottom: null
			},
			bottom: null
		};
	}
	init_faces() {
		return {
			center: {
				top: null,
				middle: null,
				bottom: null
			},
			left: {
				top: { triangle: null, hexagon: null },
				bottom: { triangle: null, hexagon: null }
			},
			right: {
				top: { triangle: null, hexagon: null },
				bottom: { triangle: null, hexagon: null }
			}
		};
	}
	calculate_verts() {
		// Top left verts
		this.add_vert("top", 0.5, 1, { v_boundary: true });
		this.add_vert(["left", "top"], 0.25, 0.75);
		this.add_vert(["left", "middle"], 0, 0.5, { u_boundary: true });
	}
	calculate_faces() {
		// Middle hexagon
		this.add_face(
			["center", "middle"],
			[
				["left", "top"],
				["left", "middle"],
				["left", "bottom"],
				["right", "bottom"],
				["right", "middle"],
				["right", "top"]
			],
			{ face_type: "hexagon" }
		);

		// Interior top triangle
		this.add_face(
			["center", "top"],
			[
				["top"],
				["left", "top"],
				["right", "top"]
			],
			{ face_type: "triangle" }
		);

		// Exterior left triangle
		this.add_face(
			["left", "top", "triangle"],
			[
				["left", "top"],
				["left", "middle"],
				left_tile(["right", "top"])
			],
			{ face_type: "triangle", u_boundary: true }
		);

		// Exterior top-left hexagon
		this.add_face(
			["left", "top", "hexagon"],
			[
				["top"],
				["left", "top"],
				left_tile(["right", "top"]),
				left_tile("top"),
				left_top_tile(["right", "bottom"]),
				top_tile(["left", "bottom"])
			],
			{ face_type: "hexagon", corner: true }
		);
	}
	color_pattern1() {
		this.color_face(["center", "middle"], 1);
		this.color_face(["left", "top", "hexagon"], 1);
	}
}
class HexTriTessagon extends Tessagon {
	static tile_class = HexTriTile;
	static metadata = hex_tri_metadata;
}


const islamic_hex_metadata = new TessagonMetadata({
	name: "Islamic Hexagons and Stars",
	num_color_patterns: 1,
	classification: "non_convex",
	shapes: ["hexagons", "stars"],
	sides: [6, 12],
	uv_ratio: Math.sqrt(3.0)
});
class IslamicHexStarsTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: {
					boundary: null,
					mid: { outer: null, mid: null, inner: null }
				},
				middle: { inner: null, outer: null },
				bottom: {
					boundary: null,
					mid: { outer: null, mid: null, inner: null }
				}
			},
			center: { top: null, bottom: null },
			right: {
				top: {
					boundary: null,
					mid: { outer: null, mid: null, inner: null }
				},
				middle: { inner: null, outer: null },
				bottom: {
					boundary: null,
					mid: { outer: null, mid: null, inner: null }
				}
			}
		};
	}
	init_faces() {
		return {
			left: {
				top: { star: null, hexagon: null },
				middle: { hexagon: null },
				bottom: { star: null, hexagon: null }
			},
			center: { star: null },
			right: {
				top: { star: null, hexagon: null },
				middle: { hexagon: null },
				bottom: { star: null, hexagon: null }
			}
		};
	}
	calculate_verts() {
		// Left verts
		this.add_vert(['left', 'top', 'boundary'], 2 / 12.0, 1, { v_boundary: true });
		this.add_vert(['left', 'top', 'mid', 'outer'], 1 / 12.0, 0.75);
		this.add_vert(['left', 'top', 'mid', 'mid'], 3 / 12.0, 0.75);
		this.add_vert(['left', 'top', 'mid', 'inner'], 5 / 12.0, 0.75);
		this.add_vert(['left', 'middle', 'outer'], 0, 0.5, { u_boundary: true });
		this.add_vert(['left', 'middle', 'inner'], 4 / 12, 0.5);
		// Center vert
		this.add_vert(['center', 'top'], 0.5, 1, { v_boundary: true });
	}
	calculate_faces() {
		this.add_face(
			['left', 'top', 'star'],
			[
				['left', 'top', 'boundary'],
				['left', 'top', 'mid', 'mid'],
				['left', 'top', 'mid', 'outer'],
				['left', 'middle', 'outer'],
				left_tile(['right', 'top', 'mid', 'outer']),
				left_tile(['right', 'top', 'mid', 'mid']),
				left_tile(['right', 'top', 'boundary']),
				top_left_tile(['right', 'bottom', 'mid', 'mid']),
				top_left_tile(['right', 'bottom', 'mid', 'outer']),
				top_tile(['left', 'middle', 'outer']),
				top_tile(['left', 'bottom', 'mid', 'outer']),
				top_tile(['left', 'bottom', 'mid', 'mid'])
			],
			{ face_type: "star", corner: true }
		);
		this.add_face(
			['left', 'top', 'hexagon'],
			[
				['center', 'top'],
				['left', 'top', 'mid', 'inner'],
				['left', 'top', 'mid', 'mid'],
				['left', 'top', 'boundary'],
				top_tile(['left', 'bottom', 'mid', 'mid']),
				top_tile(['left', 'bottom', 'mid', 'inner'])
			],
			{ face_type: "hexagon", v_boundary: true }
		);
		this.add_face(
			['left', 'middle', 'hexagon'],
			[
				['left', 'middle', 'outer'],
				['left', 'top', 'mid', 'outer'],
				['left', 'top', 'mid', 'mid'],
				['left', 'middle', 'inner'],
				['left', 'bottom', 'mid', 'mid'],
				['left', 'bottom', 'mid', 'outer']
			],
			{ face_type: "hexagon" }
		);
		this.add_face(
			['center', 'star'],
			[
				['center', 'top'],
				['right', 'top', 'mid', 'inner'],
				['right', 'top', 'mid', 'mid'],
				['right', 'middle', 'inner'],
				['right', 'bottom', 'mid', 'mid'],
				['right', 'bottom', 'mid', 'inner'],
				['center', 'bottom'],
				['left', 'bottom', 'mid', 'inner'],
				['left', 'bottom', 'mid', 'mid'],
				['left', 'middle', 'inner'],
				['left', 'top', 'mid', 'mid'],
				['left', 'top', 'mid', 'inner']
			],
			{ face_type: "star" }
		);
	}
	color_pattern1() {
		this.color_face(['left', 'top', 'star'], 1);
		this.color_face(['center', 'star'], 1);
	}
}
class IslamicHexStarsTessagon extends Tessagon {
	static tile_class = IslamicHexStarsTile;
	static metadata = islamic_hex_metadata;
}


const islamic_stars_metadata = new TessagonMetadata({
	name: "Islamic Stars and Crosses",
	num_color_patterns: 1,
	classification: "non_convex",
	shapes: ["stars", "crosses"],
	sides: [16],
	uv_ratio: 1.0
});
class IslamicStarsCrossesTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}

	init_verts() {
		return {
			left: {
				top: { v_dominant: null, point: null, u_dominant: null },
				middle: null,
				bottom: { v_dominant: null, point: null, u_dominant: null }
			},
			center: { top: null, bottom: null },
			right: {
				top: { v_dominant: null, point: null, u_dominant: null },
				middle: null,
				bottom: { v_dominant: null, point: null, u_dominant: null }
			}
		};
	}

	init_faces() {
		return {
			left: { top: null, bottom: null },
			center: null,
			right: { top: null, bottom: null }
		};
	}

	calculate_verts() {
		const c = 1.0 / (2 * (Math.sqrt(2) + 1));
		const a = c / Math.sqrt(2);
		// left top corner
		this.add_vert(["left", "middle"], 0.0, 0.5, { u_boundary: true });
		this.add_vert(["left", "top", "u_dominant"], a, 0.5 + a);
		this.add_vert(["left", "top", "point"], a, 1.0 - a);
		this.add_vert(["left", "top", "v_dominant"], 0.5 - a, 1.0 - a);
		this.add_vert(["center", "top"], 0.5, 1.0, { v_boundary: true });
	}

	calculate_faces() {
		// Middle star
		this.add_face(
			["center"],
			[
				["left", "middle"],
				["left", "top", "u_dominant"],
				["left", "top", "point"],
				["left", "top", "v_dominant"],
				["center", "top"],
				["right", "top", "v_dominant"],
				["right", "top", "point"],
				["right", "top", "u_dominant"],
				["right", "middle"],
				["right", "bottom", "u_dominant"],
				["right", "bottom", "point"],
				["right", "bottom", "v_dominant"],
				["center", "bottom"],
				["left", "bottom", "v_dominant"],
				["left", "bottom", "point"],
				["left", "bottom", "u_dominant"]
			],
			{ face_type: "star" }
		);
		// Top left cross
		this.add_face(
			["left", "top"],
			[
				["center", "top"],
				["left", "top", "v_dominant"],
				["left", "top", "point"],
				["left", "top", "u_dominant"],
				["left", "middle"],
				left_tile(["right", "top", "u_dominant"]),
				left_tile(["right", "top", "point"]),
				left_tile(["right", "top", "v_dominant"]),
				left_tile(["center", "top"]),
				top_left_tile(["right", "bottom", "v_dominant"]),
				top_left_tile(["right", "bottom", "point"]),
				top_left_tile(["right", "bottom", "u_dominant"]),
				top_left_tile(["right", "middle"]),
				top_tile(["left", "bottom", "u_dominant"]),
				top_tile(["left", "bottom", "point"]),
				top_tile(["left", "bottom", "v_dominant"])
			],
			{ face_type: "cross", corner: true }
		);
	}

	color_pattern1() {
		this.color_face(["left", "top"], 1);
		this.color_face(["center"], 0);
	}
}
class IslamicStarsCrossesTessagon extends Tessagon {
	static tile_class = IslamicStarsCrossesTile;
	static metadata = islamic_stars_metadata;
}


const octo_metadata = new TessagonMetadata({
	name: "Octagons and Squares",
	num_color_patterns: 1,
	classification: "archimedean",
	shapes: ["octagons", "squares"],
	sides: [8, 4],
	uv_ratio: 1.0
});
class OctoTile extends Tile {
	static CORNER_TO_VERT_RATIO = 1.0 / (2.0 + Math.sqrt(2));
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: { u_boundary: null, v_boundary: null },
				bottom: { u_boundary: null, v_boundary: null }
			},
			right: {
				top: { u_boundary: null, v_boundary: null },
				bottom: { u_boundary: null, v_boundary: null }
			}
		};
	}
	init_faces() {
		return {
			middle: null,
			left: { top: null, bottom: null },
			right: { top: null, bottom: null }
		};
	}
	calculate_verts() {
		this.add_vert(
			["left", "top", "v_boundary"],
			OctoTile.CORNER_TO_VERT_RATIO,
			1,
			{ v_boundary: true }
		);
		this.add_vert(
			["left", "top", "u_boundary"],
			0,
			1.0 - OctoTile.CORNER_TO_VERT_RATIO,
			{ u_boundary: true }
		);
	}
	calculate_faces() {
		// Middle interior face
		this.add_face(
			"middle",
			[
				["left", "top", "v_boundary"],
				["left", "top", "u_boundary"],
				["left", "bottom", "u_boundary"],
				["left", "bottom", "v_boundary"],
				["right", "bottom", "v_boundary"],
				["right", "bottom", "u_boundary"],
				["right", "top", "u_boundary"],
				["right", "top", "v_boundary"]
			]
		);
		// Four faces defining top left corner, others via symmetry
		this.add_face(
			["left", "top"],
			[
				["left", "top", "v_boundary"],
				["left", "top", "u_boundary"],
				left_tile(["right", "top", "v_boundary"]),
				top_tile(["left", "bottom", "u_boundary"])
			],
			{ corner: true }
		);
	}
	color_pattern1() {
		this.color_face(["middle"], 1);
	}
}
class OctoTessagon extends Tessagon {
	static tile_class = OctoTile;
	static metadata = octo_metadata;
}


const penta_metadata = new TessagonMetadata({
	name: "Pentagons",
	num_color_patterns: 1,
	classification: "laves",
	shapes: ["pentagons"],
	sides: [5],
	uv_ratio: 1.0
});
class PentaTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: {
					u_boundary: null,
					v_boundary: null,
					interior: null
				},
				middle: null,
				bottom: {
					u_boundary: null,
					v_boundary: null,
					interior: null
				}
			},
			center: {
				top: null,
				bottom: null
			},
			right: {
				top: {
					u_boundary: null,
					v_boundary: null,
					interior: null
				},
				middle: null,
				bottom: {
					u_boundary: null,
					v_boundary: null,
					interior: null
				}
			}
		};
	}
	init_faces() {
		return {
			left: {
				top: {
					u_boundary: null,
					v_boundary: null
				},
				middle: null,
				bottom: {
					u_boundary: null,
					v_boundary: null
				}
			},
			center: {
				top: null,
				bottom: null
			},
			right: {
				top: {
					u_boundary: null,
					v_boundary: null
				},
				middle: null,
				bottom: {
					u_boundary: null,
					v_boundary: null
				}
			}
		};
	}
	calculate_verts() {
		const u_unit = 1.0 / (1.0 + Math.sqrt(3));
		const u0 = 0, v0 = 0;
		const u1 = u_unit / (2 * Math.sqrt(3));
		const v1 = u_unit / (2 * Math.sqrt(3));
		const u3 = (0.5 + 1 / Math.sqrt(3)) * u_unit;
		const v3 = (0.5 + 1 / Math.sqrt(3)) * u_unit;
		const u2 = 0.5 * (u1 + u3);
		const v2 = 0.5 * (v1 + v3);
		const u4 = 0.5, v4 = 0.5;

		this.add_vert(["left", "bottom", "u_boundary"], u0, v1, { u_boundary: true });
		this.add_vert(["left", "bottom", "v_boundary"], u3, v0, { v_boundary: true });
		this.add_vert(["left", "bottom", "interior"], u2, v2);
		this.add_vert(["left", "middle"], u1, v4);
		this.add_vert(["center", "bottom"], u4, v3);
	}
	calculate_faces() {
		this.add_face(
			["left", "bottom", "u_boundary"],
			[
				["left", "bottom", "u_boundary"],
				["left", "bottom", "interior"],
				["left", "middle"],
				left_tile(["right", "middle"]),
				left_tile(["right", "bottom", "interior"])
			],
			{ u_boundary: true }
		);

		this.add_face(
			["left", "bottom", "v_boundary"],
			[
				["left", "bottom", "u_boundary"],
				["left", "bottom", "interior"],
				["left", "bottom", "v_boundary"],
				bottom_tile(["left", "top", "interior"]),
				bottom_tile(["left", "top", "u_boundary"])
			],
			{ v_boundary: true }
		);

		this.add_face(
			["left", "middle"],
			[
				["left", "middle"],
				["left", "bottom", "interior"],
				["center", "bottom"],
				["center", "top"],
				["left", "top", "interior"]
			]
		);

		this.add_face(
			["center", "bottom"],
			[
				["left", "bottom", "interior"],
				["center", "bottom"],
				["right", "bottom", "interior"],
				["right", "bottom", "v_boundary"],
				["left", "bottom", "v_boundary"]
			]
		);
	}
	color_pattern1() {
		this.color_paths(
			[
				["right", "middle"],
				["center", "bottom"],
				["right", "bottom", "v_boundary"],
				["right", "bottom", "u_boundary"]
			],
			1,
			0
		);
	}
}
class PentaTessagon extends Tessagon {
	static tile_class = PentaTile;
	static metadata = penta_metadata;
}


const penta2_metadata = new TessagonMetadata({
	name: "Other Pentagons",
	num_color_patterns: 1,
	classification: "laves",
	shapes: ["pentagons"],
	sides: [5],
	uv_ratio: 1.0 / (2.0 + Math.sqrt(3.0))
});
class Penta2Tile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: {
					corner: null,
					u_boundary: null
				},
				bottom: {
					corner: null,
					u_boundary: null
				}
			},
			right: {
				top: {
					corner: null,
					u_boundary: null
				},
				bottom: {
					corner: null,
					u_boundary: null
				}
			},
			center: {
				top: null,
				middle: null,
				bottom: null
			}
		};
	}
	init_faces() {
		return {
			left: {
				top: null,
				bottom: null
			},
			right: {
				top: null,
				bottom: null
			},
			center: {
				top: null,
				bottom: null
			}
		};
	}
	calculate_verts() {
		const v_unit = 1.0 / (2.0 + Math.sqrt(3.0));
		const v0 = 0;
		const v1 = v_unit * 0.5 * (1.0 + 1.0 / Math.sqrt(3.0));
		const v2 = 0.5 - v1;
		this.add_vert(["left", "bottom", "corner"], 0, v0, { corner: true });
		this.add_vert(["left", "bottom", "u_boundary"], 0, v1, { u_boundary: true });
		this.add_vert(["center", "bottom"], 0.5, v2);
		this.add_vert(["center", "middle"], 0.5, 0.5);
	}
	calculate_faces() {
		this.add_face(
			["center", "bottom"],
			[
				["left", "bottom", "corner"],
				["left", "bottom", "u_boundary"],
				["center", "bottom"],
				["right", "bottom", "u_boundary"],
				["right", "bottom", "corner"]
			]
		);
		this.add_face(
			["left", "bottom"],
			[
				["center", "middle"],
				["center", "bottom"],
				["left", "bottom", "u_boundary"],
				left_tile(["center", "bottom"]),
				left_tile(["center", "middle"])
			],
			{ u_boundary: true }
		);
	}
	color_pattern1() {
		this.color_paths(
			[
				["center", "top"],
				["left", "bottom"],
				["right", "bottom"]
			],
			1,
			0
		);
	}
}
class Penta2Tessagon extends Tessagon {
	static tile_class = Penta2Tile;
	static metadata = penta2_metadata;
}


const pythagorean_metadata = new TessagonMetadata({
	name: "Pythagorean",
	num_color_patterns: 1,
	classification: "non_edge",
	shapes: ["squares"],
	sides: [4],
	uv_ratio: 1.0
});
class PythagoreanTile extends Tile {
	init_verts() {
		return {
			"1": { "1": null, "2": null, "4": null, "5": null, "6": null },
			"2": { "2": null, "3": null, "4": null, "5": null },
			"3": { "1": null, "2": null, "3": null, "5": null, "6": null },
			"4": { "1": null, "3": null, "4": null, "5": null, "6": null },
			"5": { "1": null, "2": null, "3": null, "4": null, "6": null },
			"6": { "1": null, "2": null, "4": null, "5": null, "6": null }
		};
	}
	calculate_verts() {
		const c = {
			"1": 0.0,
			"2": 1 / 5.0,
			"3": 2 / 5.0,
			"4": 3 / 5.0,
			"5": 4 / 5.0,
			"6": 1.0
		};
		for (const col in this.verts) {
			for (const row in this.verts[col]) {
				const colNum = Number(col);
				const rowNum = Number(row);
				if (colNum === 1) {
					if (!this.get_neighbor_tile(["left"])) {
						if (rowNum === 6 && !this.get_neighbor_tile(["top"])) {
							continue;
						}
						if (!this.get_neighbor_tile(["bottom"])) {
							if (rowNum === 1 || rowNum === 2) {
								continue;
							}
						}
					}
				}
				const vert = this.add_vert([colNum, rowNum], c[col], c[row]);
				if (colNum === 1) {
					this.set_equivalent_vert(...left_tile([6, rowNum]), vert);
					if (rowNum === 6) {
						this.set_equivalent_vert(...left_top_tile([6, 1]), vert);
					} else if (rowNum === 1) {
						this.set_equivalent_vert(...left_bottom_tile([6, 6]), vert);
					}
				} else if (colNum === 6) {
					this.set_equivalent_vert(...right_tile([1, rowNum]), vert);
					if (rowNum === 6) {
						this.set_equivalent_vert(...right_top_tile([1, 1]), vert);
					} else if (rowNum === 1) {
						this.set_equivalent_vert(...right_bottom_tile([1, 6]), vert);
					}
				}
				if (rowNum === 6) {
					this.set_equivalent_vert(...top_tile([colNum, 1]), vert);
				} else if (rowNum === 1) {
					this.set_equivalent_vert(...bottom_tile([colNum, 6]), vert);
				}
			}
		}
	}
	init_faces() {
		return {
			"1": null, "2": null, "3": null, "4": null, "5": null, "6": null,
			"7": null, "8": null, "9": null, "10": null, "11": null, "12": null
		};
	}
	calculate_faces() {
		let face = this.add_face(1, [
			[1, 6],
			[1, 5],
			[2, 5],
			[3, 5],
			[3, 6],
			top_tile([3, 2]),
			top_tile([2, 2]),
			top_tile([1, 2])
		]);
		this.set_equivalent_face(...top_tile(11), face);
		this.add_face(2, [
			[3, 6],
			[4, 6],
			[4, 5],
			[3, 5]
		]);
		this.add_face(3, [
			[4, 6],
			[5, 6],
			[6, 6],
			[6, 5],
			[6, 4],
			[5, 4],
			[4, 4],
			[4, 5]
		]);
		this.add_face(4, [
			[1, 5],
			[2, 5],
			[2, 4],
			[1, 4]
		]);
		this.add_face(5, [
			[2, 5],
			[3, 5],
			[4, 5],
			[4, 4],
			[4, 3],
			[3, 3],
			[2, 3],
			[2, 4]
		]);
		face = this.add_face(6, [
			[1, 4],
			[2, 4],
			[2, 3],
			[2, 2],
			[1, 2],
			left_tile([5, 2]),
			left_tile([5, 3]),
			left_tile([5, 4])
		]);
		this.set_equivalent_face(...left_tile(8), face);
		this.add_face(7, [
			[4, 4],
			[5, 4],
			[5, 3],
			[4, 3]
		]);
		face = this.add_face(8, [
			[6, 4],
			[5, 4],
			[5, 3],
			[5, 2],
			[6, 2],
			right_tile([2, 2]),
			right_tile([2, 3]),
			right_tile([2, 4])
		]);
		this.set_equivalent_face(...right_tile(6), face);
		this.add_face(9, [
			[2, 3],
			[3, 3],
			[3, 2],
			[2, 2]
		]);
		this.add_face(10, [
			[3, 3],
			[4, 3],
			[5, 3],
			[5, 2],
			[5, 1],
			[4, 1],
			[3, 1],
			[3, 2]
		]);
		face = this.add_face(11, [
			[1, 1],
			[1, 2],
			[2, 2],
			[3, 2],
			[3, 1],
			bottom_tile([3, 5]),
			bottom_tile([2, 5]),
			bottom_tile([1, 5])
		]);
		this.set_equivalent_face(...bottom_tile(1), face);
		this.add_face(12, [
			[5, 2],
			[6, 2],
			[6, 1],
			[5, 1]
		]);
	}
	color_pattern1() {
		this.color_face([1], 1);
		this.color_face([3], 1);
		this.color_face([5], 1);
		this.color_face([6], 1);
		this.color_face([8], 1);
		this.color_face([10], 1);
		this.color_face([11], 1);
	}
}
class PythagoreanTessagon extends Tessagon {
	static tile_class = PythagoreanTile;
	static metadata = pythagorean_metadata;
}

const rhombus_metadata = new TessagonMetadata({
	name: 'Rhombuses',
	num_color_patterns: 2,
	classification: 'laves',
	shapes: ['rhombuses'],
	sides: [4],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class RhombusTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: { top: null, middle: null, bottom: null },
			center: {
				top: { boundary: null, interior: null },
				bottom: { boundary: null, interior: null }
			},
			right: { top: null, middle: null, bottom: null }
		};
	}
	init_faces() {
		return {
			middle: null,
			left: {
				top: { interior: null, exterior: null },
				bottom: { interior: null, exterior: null }
			},
			right: {
				top: { interior: null, exterior: null },
				bottom: { interior: null, exterior: null }
			}
		};
	}
	calculate_verts() {
		// 10 verts, do top left quadrant, others via symmetry
		this.add_vert(['center', 'top', 'boundary'], 0.5, 1, { v_boundary: true });
		this.add_vert(['left', 'top'], 0, 5.0 / 6.0, { u_boundary: true });
		this.add_vert(['center', 'top', 'interior'], 0.5, 2.0 / 3.0);
		this.add_vert(['left', 'middle'], 0, 1.0 / 2.0, { u_boundary: true });
	}
	calculate_faces() {
		// One middle face
		this.add_face(
			'middle',
			[
				['center', 'top', 'interior'],
				['left', 'middle'],
				['center', 'bottom', 'interior'],
				['right', 'middle']
			],
			{ face_type: 'horizontal' }
		);
		// Eight others, define only left top, others by symmetry
		this.add_face(
			['left', 'top', 'interior'],
			[
				['center', 'top', 'boundary'],
				['left', 'top'],
				['left', 'middle'],
				['center', 'top', 'interior']
			],
			{ face_type: 'upward' }
		);
		this.add_face(
			['left', 'top', 'exterior'],
			[
				['center', 'top', 'boundary'],
				['left', 'top'],
				left_tile(['center', 'top', 'boundary']),
				top_tile(['left', 'bottom'])
			],
			{ face_type: 'horizontal', corner: true }
		);
	}
	color_pattern1() {
		this.color_face(['middle'], 1);
		this.color_face(['left', 'top', 'exterior'], 1);
		this.color_face(['left', 'top', 'interior'], 2);
		this.color_face(['right', 'bottom', 'interior'], 2);
	}
	color_pattern2() {
		this.color_face(['left', 'top', 'interior'], 1);
		this.color_face(['right', 'top', 'interior'], 1);
		this.color_face(['left', 'bottom', 'interior'], 2);
		this.color_face(['right', 'bottom', 'interior'], 2);
	}
}
class RhombusTessagon extends Tessagon {
	static tile_class = RhombusTile;
	static metadata = rhombus_metadata;
}

const square_metadata = new TessagonMetadata({
	name: "Regular Squares",
	num_color_patterns: 8,
	classification: "regular",
	shapes: ["squares"],
	sides: [4],
	uv_ratio: 1.0
});
class SquareTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			top: { left: null, right: null },
			bottom: { left: null, right: null }
		};
	}
	init_faces() {
		return {
			middle: null
		};
	}
	calculate_verts() {
		this.add_vert(["top", "left"], 0, 1, { corner: true });
	}
	calculate_faces() {
		this.add_face("middle", [
			["top", "left"],
			["top", "right"],
			["bottom", "right"],
			["bottom", "left"]
		]);
	}
	color_pattern1() {
		if (((this.fingerprint[0] + this.fingerprint[1]) % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			this.color_face(["middle"], 1);
		}
	}
	color_pattern2() {
		if (((this.fingerprint[0] + this.fingerprint[1]) % 2) === 0) {
			this.color_face(["middle"], 0);
		} else if ((this.fingerprint[0] % 2) === 0) {
			this.color_face(["middle"], 1);
		} else {
			this.color_face(["middle"], 2);
		}
	}
	color_pattern3() {
		if (((this.fingerprint[0] * this.fingerprint[1]) % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			this.color_face(["middle"], 1);
		}
	}
	color_pattern4() {
		if ((this.fingerprint[1] % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			if (((Math.floor(this.fingerprint[1] / 2) + this.fingerprint[0]) % 2) === 0) {
				this.color_face(["middle"], 0);
			} else {
				this.color_face(["middle"], 1);
			}
		}
	}
	color_pattern5() {
		if ((this.fingerprint[1] % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			this.color_face(["middle"], 1);
		}
	}
	color_pattern6() {
		if ((this.fingerprint[1] % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			if ((this.fingerprint[0] % 2) === 0) {
				this.color_face(["middle"], 1);
			} else {
				this.color_face(["middle"], 2);
			}
		}
	}
	color_pattern7() {
		if ((this.fingerprint[1] % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			if (((Math.floor(this.fingerprint[1] / 2) + this.fingerprint[0]) % 2) === 0) {
				this.color_face(["middle"], 1);
			} else {
				this.color_face(["middle"], 2);
			}
		}
	}
	color_pattern8() {
		if ((this.fingerprint[1] % 2) === 0) {
			if ((this.fingerprint[0] % 2) === 0) {
				this.color_face(["middle"], 0);
			} else {
				this.color_face(["middle"], 1);
			}
		} else {
			if ((this.fingerprint[0] % 2) === 0) {
				this.color_face(["middle"], 2);
			} else {
				this.color_face(["middle"], 3);
			}
		}
	}
}
class SquareTessagon extends Tessagon {
	static tile_class = SquareTile;
	static metadata = square_metadata;
}

const square_tri_metadata = new TessagonMetadata({
	name: "Squares and Triangles",
	num_color_patterns: 2,
	classification: "archimedean",
	shapes: ["squares", "triangles"],
	sides: [4, 3],
	uv_ratio: 1.0
});
class SquareTriTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			top: {
				left: { u_boundary: null, v_boundary: null },
				right: { u_boundary: null, v_boundary: null },
				center: null
			},
			bottom: {
				left: { u_boundary: null, v_boundary: null },
				right: { u_boundary: null, v_boundary: null },
				center: null
			},
			middle: {
				left: null,
				right: null
			}
		};
	}
	init_faces() {
		return {
			tri: {
				top: {
					left: { u_boundary: null, v_boundary: null },
					right: { u_boundary: null, v_boundary: null },
					center: null
				},
				bottom: {
					left: { u_boundary: null, v_boundary: null },
					right: { u_boundary: null, v_boundary: null },
					center: null
				},
				middle: {
					left: null,
					right: null
				}
			},
			square: {
				top: { left: null, right: null },
				bottom: { left: null, right: null }
			}
		};
	}
	calculate_verts() {
		const u_unit = 1.0 / (1.0 + Math.sqrt(3));
		const u0 = 0;
		const u1 = 0.5 * u_unit;
		const u2 = 0.5 * (1.0 - u_unit);
		const u3 = 0.5;
		const v_unit = 1.0 / (1.0 + Math.sqrt(3));
		const v0 = 0.5;
		const v1 = 0.5 * (1.0 + v_unit);
		const v2 = 1.0 - 0.5 * v_unit;
		const v3 = 1.0;
		this.add_vert(["top", "left", "u_boundary"], u0, v1, { u_boundary: true });
		this.add_vert(["top", "left", "v_boundary"], u1, v3, { v_boundary: true });
		this.add_vert(["top", "center"], u3, v2);
		this.add_vert(["middle", "left"], u2, v0);
	}
	calculate_faces() {
		this.add_face(
			["square", "top", "left"],
			[
				["top", "left", "u_boundary"],
				["top", "left", "v_boundary"],
				["top", "center"],
				["middle", "left"]
			],
			{ face_type: "square" }
		);
		this.add_face(
			["tri", "top", "left", "u_boundary"],
			[
				["top", "left", "v_boundary"],
				["top", "left", "u_boundary"],
				[["left"], ["top", "right", "v_boundary"]]
			],
			{ face_type: "triangle", u_boundary: true }
		);
		this.add_face(
			["tri", "top", "left", "v_boundary"],
			[
				["top", "left", "v_boundary"],
				["top", "center"],
				[["top"], ["bottom", "center"]]
			],
			{ face_type: "triangle", v_boundary: true }
		);
		this.add_face(
			["tri", "top", "center"],
			[
				["top", "center"],
				["middle", "right"],
				["middle", "left"]
			],
			{ face_type: "triangle" }
		);
		this.add_face(
			["tri", "middle", "left"],
			[
				["middle", "left"],
				["bottom", "left", "u_boundary"],
				["top", "left", "u_boundary"]
			],
			{ face_type: "triangle" }
		);
	}
	color_pattern1() {
		this.color_face(["square", "top", "left"], 1);
		this.color_face(["square", "top", "right"], 1);
		this.color_face(["square", "bottom", "left"], 1);
		this.color_face(["square", "bottom", "right"], 1);
	}
	color_pattern2() {
		this.color_face(["square", "top", "left"], 1);
		this.color_face(["square", "top", "right"], 1);
		this.color_face(["square", "bottom", "left"], 1);
		this.color_face(["square", "bottom", "right"], 1);
		this.color_face(["tri", "middle", "left"], 2);
		this.color_face(["tri", "middle", "right"], 2);
		this.color_face(["tri", "top", "left", "v_boundary"], 2);
		this.color_face(["tri", "top", "right", "v_boundary"], 2);
	}
}
class SquareTriTessagon extends Tessagon {
	static tile_class = SquareTriTile;
	static metadata = square_tri_metadata;
}


const square_tri2_metadata = new TessagonMetadata({
	name: "Other Squares and Triangles",
	num_color_patterns: 1,
	classification: "archimedean",
	shapes: ["squares", "triangles"],
	sides: [4, 3],
	uv_ratio: 1.0 / (2.0 + Math.sqrt(3.0))
});
class SquareTri2Tile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: { u_boundary: null },
				bottom: { u_boundary: null }
			},
			right: {
				top: { u_boundary: null },
				bottom: { u_boundary: null }
			},
			center: {
				top: null,
				bottom: null
			}
		};
	}
	init_faces() {
		return {
			left: {
				top: { corner: null, u_boundary: null },
				bottom: { corner: null, u_boundary: null }
			},
			right: {
				top: { corner: null, u_boundary: null },
				bottom: { corner: null, u_boundary: null }
			},
			center: {
				top: null,
				middle: null,
				bottom: null
			}
		};
	}
	calculate_verts() {
		const v_unit = 1.0 / (2 + Math.sqrt(3));
		const v1 = v_unit * 0.5;
		const v2 = 0.5 - v1;
		// Other verts defined through symmetry
		this.add_vert(["center", "bottom"], 0.5, v1);
		this.add_vert(["left", "bottom", "u_boundary"], 0, v2, { u_boundary: true });
	}
	calculate_faces() {
		this.add_face(
			["left", "bottom", "corner"],
			[
				["center", "bottom"],
				[["left"], ["center", "bottom"]],
				[["left", "bottom"], ["center", "top"]],
				[["bottom"], ["center", "top"]]
			],
			{ face_type: "square", corner: true }
		);

		this.add_face(
			["left", "bottom", "u_boundary"],
			[
				["center", "bottom"],
				["left", "bottom", "u_boundary"],
				[["left"], ["center", "bottom"]]
			],
			{ face_type: "triangle", u_boundary: true }
		);

		this.add_face(
			["center", "bottom"],
			[
				["left", "bottom", "u_boundary"],
				["center", "bottom"],
				["right", "bottom", "u_boundary"]
			],
			{ face_type: "triangle" }
		);

		this.add_face(
			["center", "middle"],
			[
				["left", "bottom", "u_boundary"],
				["right", "bottom", "u_boundary"],
				["right", "top", "u_boundary"],
				["left", "top", "u_boundary"]
			],
			{ face_type: "square" }
		);
	}
	color_pattern1() {
		this.color_paths(
			[
				["left", "bottom", "corner"],
				["center", "middle"]
			],
			1,
			0
		);
	}
}
class SquareTri2Tessagon extends Tessagon {
	static tile_class = SquareTri2Tile;
	static metadata = square_tri2_metadata;
}


const stanley_metadata = new TessagonMetadata({
	name: "Stanley Park",
	num_color_patterns: 2,
	classification: "non_convex",
	sides: [12],
	uv_ratio: Math.sqrt(3.0)
});
class StanleyParkTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = false;
	}
	init_verts() {
		return {
			top: { left: null, right: null },
			mid1: { left: null, right: null },
			mid2: { left: null, center: null, right: null },
			mid3: {
				left: { outer: null, inner: null },
				right: { inner: null, outer: null }
			},
			bottom: { left: null, right: null }
		};
	}
	init_faces() {
		return {
			top: { left: null, center: null, right: null },
			bottom: { left: null, center: null, right: null }
		};
	}
	calculate_verts() {
		let vert = this.add_vert(["top", "left"], 2 / 6, 1.0);
		this.set_equivalent_vert(...top_tile(["bottom", "left"]), vert);
		vert = this.add_vert(["top", "right"], 4 / 6, 1.0);
		this.set_equivalent_vert(...top_tile(["bottom", "right"]), vert);
		this.add_vert(["mid1", "left"], 1 / 6, 5 / 6);
		this.add_vert(["mid2", "left"], 1 / 6, 3 / 6);
		this.add_vert(["mid2", "center"], 3 / 6, 3 / 6);
		this.add_vert(["mid3", "left", "outer"], 0.0, 2 / 6, { u_boundary: true });
		this.add_vert(["mid3", "left", "inner"], 2 / 6, 2 / 6);
		vert = this.add_vert(["bottom", "left"], 2 / 6, 0.0);
		this.set_equivalent_vert(...bottom_tile(["top", "left"]), vert);
		vert = this.add_vert(["bottom", "right"], 4 / 6, 0.0);
		this.set_equivalent_vert(...bottom_tile(["top", "right"]), vert);
	}
	calculate_faces() {
		let face = this.add_face(
			["top", "left"],
			[
				["mid3", "left", "outer"],
				["mid2", "left"],
				["mid1", "left"],
				["top", "left"],
				top_tile(["mid3", "left", "inner"]),
				top_tile(["mid2", "left"]),
				top_tile(["mid3", "left", "outer"]),
				top_left_tile(["mid2", "right"]),
				top_left_tile(["mid3", "right", "inner"]),
				left_tile(["top", "right"]),
				left_tile(["mid1", "right"]),
				left_tile(["mid2", "right"])
			],
			{ u_boundary: true }
		);
		this.set_equivalent_face(...top_tile(["bottom", "left"]), face);
		this.set_equivalent_face(...top_left_tile(["bottom", "right"]), face);
		this.set_equivalent_face(...left_tile(["top", "right"]), face);
		face = this.add_face(
			["top", "center"],
			[
				["top", "left"],
				["mid1", "left"],
				["mid2", "left"],
				["mid3", "left", "inner"],
				["mid2", "center"],
				["mid3", "right", "inner"],
				["mid2", "right"],
				["mid1", "right"],
				["top", "right"],
				top_tile(["mid3", "right", "inner"]),
				top_tile(["mid2", "center"]),
				top_tile(["mid3", "left", "inner"])
			]
		);
		this.set_equivalent_face(...top_tile(["bottom", "center"]), face);
	}
	color_pattern1() {
		this.color_face(["top", "center"], 1);
		this.color_face(["bottom", "center"], 1);
	}
	color_pattern2() {
		if (this.fingerprint[1] % 2 === 0) {
			this.color_face(["top", "left"], 1);
			this.color_face(["top", "center"], 1);
			this.color_face(["top", "right"], 1);
		}
	}
}
class StanleyParkTessagon extends Tessagon {
	static tile_class = StanleyParkTile;
	static metadata = stanley_metadata;
}


const tri_metadata = new TessagonMetadata({
	name: "Regular Triangles",
	num_color_patterns: 3,
	classification: "regular",
	shapes: ["triangles"],
	sides: [3],
	uv_ratio: Math.sqrt(3.0)
});
class TriTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: { top: null, bottom: null },
			middle: null,
			right: { top: null, bottom: null }
		};
	}
	init_faces() {
		return {
			left: { top: null, middle: null, bottom: null },
			right: { top: null, middle: null, bottom: null }
		};
	}
	calculate_verts() {
		this.add_vert(["left", "top"], 0, 1, { corner: true });
		this.add_vert("middle", 0.5, 0.5);
	}
	calculate_faces() {
		this.add_face(
			["left", "top"],
			[
				["left", "top"],
				["middle"],
				top_tile(["middle"])
			],
			{ v_boundary: true }
		);
		this.add_face(
			["left", "middle"],
			[
				["left", "top"],
				["left", "bottom"],
				["middle"]
			]
		);
	}
	color_pattern1() {
		this.color_face(["left", "top"], 0);
		this.color_face(["right", "top"], 1);
		this.color_face(["left", "middle"], 1);
		this.color_face(["right", "middle"], 0);
		this.color_face(["left", "bottom"], 0);
		this.color_face(["right", "bottom"], 1);
	}
	color_pattern2() {
		if (!this.fingerprint) return;
		if (this.fingerprint[1] % 3 === 0) {
			if (this.fingerprint[0] % 3 === 0) {
				this.color_0_0();
			} else if (this.fingerprint[0] % 3 === 1) {
				this.color_0_1();
			}
		} else if (this.fingerprint[1] % 3 === 1) {
			if (this.fingerprint[0] % 3 === 0) {
				this.color_1_0();
			} else if (this.fingerprint[0] % 3 === 1) {
				this.color_1_1();
			} else {
				this.color_1_2();
			}
		} else {
			if (this.fingerprint[0] % 3 === 0) {
				this.color_2_0();
			} else if (this.fingerprint[0] % 3 === 1) {
				this.color_2_1();
			} else {
				this.color_2_2();
			}
		}
	}
	color_pattern3() {
		if (!this.fingerprint) return;
		if (this.fingerprint[1] % 3 === 2) {
			this.color_paths([["left", "middle"], ["right", "bottom"]], 1, 0);
		} else if (this.fingerprint[1] % 3 === 1) {
			this.color_paths([["right", "top"], ["right", "bottom"]], 1, 0);
		} else {
			this.color_paths([["left", "middle"], ["right", "top"]], 1, 0);
		}
	}
	color_0_0() {
		this.color_paths([], 0, 1);
	}
	color_0_1() {
		const paths = [
			["left", "top"],
			["left", "bottom"],
			["right", "middle"]
		];
		this.color_paths(paths, 1, 0);
	}
	color_1_0() {
		const paths = [
			["left", "top"],
			["left", "bottom"],
			["right", "bottom"]
		];
		this.color_paths(paths, 1, 0);
	}
	color_1_1() {
		const paths = [
			["left", "bottom"],
			["right", "top"],
			["right", "middle"]
		];
		this.color_paths(paths, 1, 0);
	}
	color_1_2() {
		const paths = [
			["left", "top"],
			["left", "middle"],
			["right", "middle"]
		];
		this.color_paths(paths, 1, 0);
	}
	color_2_0() {
		const paths = [
			["left", "top"],
			["left", "bottom"],
			["right", "top"]
		];
		this.color_paths(paths, 1, 0);
	}
	color_2_1() {
		const paths = [
			["left", "top"],
			["right", "middle"],
			["right", "bottom"]
		];
		this.color_paths(paths, 1, 0);
	}
	color_2_2() {
		const paths = [
			["left", "middle"],
			["left", "bottom"],
			["right", "middle"]
		];
		this.color_paths(paths, 1, 0);
	}
}
class TriTessagon extends Tessagon {
	static tile_class = TriTile;
	static metadata = tri_metadata;
}


const valemount_metadata = new TessagonMetadata({
	name: "Valemount",
	num_color_patterns: 1,
	classification: "non_edge",
	shapes: ["rectangles", "squares"],
	sides: [4],
	uv_ratio: 1.0
});
class ValemountTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = false;
		this.v_symmetric = false;
	}
	init_verts() {
		return {
			1: null,
			2: null,
			3: null,
			4: null,
			5: null,
			6: null,
			7: null,
			8: null,
			9: null,
			10: null,
			11: null,
			12: null,
			13: null,
			14: null,
			15: null,
			16: null
		};
	}
	init_faces() {
		return {
			top_left: null,
			top_right: null,
			bottom_left: null,
			bottom_right: null,
			center: null
		};
	}
	calculate_verts() {
		// Top row
		let vert = this.add_vert([1], 0, 1);
		this.set_equivalent_vert(...left_tile(4), vert);
		this.set_equivalent_vert(...top_tile(13), vert);
		this.set_equivalent_vert(...top_left_tile(16), vert);
		vert = this.add_vert([2], 1 / 3.0, 1);
		this.set_equivalent_vert(...top_tile(14), vert);
		vert = this.add_vert([3], 2 / 3.0, 1);
		this.set_equivalent_vert(...top_tile(15), vert);
		vert = this.add_vert([4], 1, 1);
		this.set_equivalent_vert(...right_tile(1), vert);
		this.set_equivalent_vert(...top_tile(16), vert);
		this.set_equivalent_vert(...top_right_tile(13), vert);
		// Next row
		vert = this.add_vert([5], 0, 2 / 3.0);
		this.set_equivalent_vert(...left_tile(8), vert);
		this.add_vert([6], 1 / 3.0, 2 / 3.0);
		this.add_vert([7], 2 / 3.0, 2 / 3.0);
		vert = this.add_vert([8], 1, 2 / 3.0);
		this.set_equivalent_vert(...right_tile(5), vert);
		// Next row
		vert = this.add_vert([9], 0, 1 / 3.0);
		this.set_equivalent_vert(...left_tile(12), vert);
		this.add_vert([10], 1 / 3.0, 1 / 3.0);
		this.add_vert([11], 2 / 3.0, 1 / 3.0);
		vert = this.add_vert([12], 1, 1 / 3.0);
		this.set_equivalent_vert(...right_tile(9), vert);
		// Bottom row
		vert = this.add_vert([13], 0, 0);
		this.set_equivalent_vert(...left_tile(16), vert);
		this.set_equivalent_vert(...bottom_tile(1), vert);
		this.set_equivalent_vert(...bottom_left_tile(4), vert);
		vert = this.add_vert([14], 1 / 3.0, 0);
		this.set_equivalent_vert(...bottom_tile(2), vert);
		vert = this.add_vert([15], 2 / 3.0, 0);
		this.set_equivalent_vert(...bottom_tile(3), vert);
		vert = this.add_vert([16], 1, 0);
		this.set_equivalent_vert(...right_tile(13), vert);
		this.set_equivalent_vert(...bottom_tile(4), vert);
		this.set_equivalent_vert(...bottom_right_tile(1), vert);
	}
	calculate_faces() {
		this.add_face("top_left", [1, 2, 6, 10, 9, 5]);
		this.add_face("top_right", [2, 3, 4, 8, 7, 6]);
		this.add_face("bottom_left", [9, 10, 11, 15, 14, 13]);
		this.add_face("bottom_right", [7, 8, 12, 16, 15, 11]);
		this.add_face("center", [6, 7, 11, 10]);
	}
	color_pattern1() {
		this.color_paths([["center"]], 1, 0);
	}
}
class ValemountTessagon extends Tessagon {
	static tile_class = ValemountTile;
	static metadata = valemount_metadata;
}


const weave_metadata = new TessagonMetadata({
	name: "Weave",
	num_color_patterns: 1,
	classification: "non_edge",
	shapes: ["quads", "rectangles"],
	sides: [4],
	uv_ratio: 1.0,
	extra_parameters: {
		square_ratio: {
			type: "float",
			min: 0.0,
			max: 1.0,
			default: 0.5,
			description: "Control the size of the squares"
		}
	}
});
class WeaveTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
		this.square_ratio = options.hasOwnProperty("square_ratio") ? options.square_ratio : 0.5;
	}
	init_verts() {
		return {
			top: {
				left: { u_inner: null, v_inner: null, v_outer: null },
				right: { u_inner: null, v_inner: null, v_outer: null }
			},
			bottom: {
				left: { u_inner: null, v_inner: null, v_outer: null },
				right: { u_inner: null, v_inner: null, v_outer: null }
			}
		};
	}
	init_faces() {
		return {
			square: {
				top: { left: null, right: null },
				bottom: { left: null, right: null }
			},
			oct: {
				top: { left: null, center: null, right: null },
				middle: { left: null, center: null, right: null },
				bottom: { left: null, center: null, right: null }
			}
		};
	}
	calculate_verts() {
		const half_square_size = 0.25 * this.square_ratio;
		const u0 = 0.25 - half_square_size;
		const u1 = 0.25 + half_square_size;
		const v0 = 0.75 - half_square_size;
		const v1 = 0.75 + half_square_size;
		console.log(this.square_ratio, u0, u1, v0, v1);
		// Define top left square, other verts defined through symmetry
		this.add_vert(["top", "left", "u_inner", "v_inner"], u1, v0);
		this.add_vert(["top", "left", "u_inner", "v_outer"], u1, v1);
		this.add_vert(["top", "left", "u_outer", "v_inner"], u0, v0);
		this.add_vert(["top", "left", "u_outer", "v_outer"], u0, v1);
	}
	calculate_faces() {
		// 4 internal squares (via symmetry)
		this.add_face(
			["square", "top", "left"],
			[
				["top", "left", "u_outer", "v_outer"],
				["top", "left", "u_inner", "v_outer"],
				["top", "left", "u_inner", "v_inner"],
				["top", "left", "u_outer", "v_inner"]
			],
			{ face_type: "square" }
		);
		// 1 interior strip
		this.add_face(
			["oct", "middle", "center"],
			[
				["top", "left", "u_outer", "v_inner"],
				["top", "left", "u_inner", "v_inner"],
				["top", "right", "u_inner", "v_inner"],
				["top", "right", "u_outer", "v_inner"],
				["bottom", "right", "u_outer", "v_inner"],
				["bottom", "right", "u_inner", "v_inner"],
				["bottom", "left", "u_inner", "v_inner"],
				["bottom", "left", "u_outer", "v_inner"]
			],
			{ face_type: "oct" }
		);
		// 4 corner strips
		this.add_face(
			["oct", "top", "left"],
			[
				["top", "left", "u_inner", "v_outer"],
				["top", "left", "u_outer", "v_outer"],
				left_tile(["top", "right", "u_outer", "v_outer"]),
				left_tile(["top", "right", "u_inner", "v_outer"]),
				left_top_tile(["bottom", "right", "u_inner", "v_outer"]),
				left_top_tile(["bottom", "right", "u_outer", "v_outer"]),
				top_tile(["bottom", "left", "u_outer", "v_outer"]),
				top_tile(["bottom", "left", "u_inner", "v_outer"])
			],
			{ face_type: "oct", corner: true }
		);
		// 2 side strips
		this.add_face(
			["oct", "middle", "left"],
			[
				["top", "left", "u_outer", "v_outer"],
				["top", "left", "u_outer", "v_inner"],
				["bottom", "left", "u_outer", "v_inner"],
				["bottom", "left", "u_outer", "v_outer"],
				left_tile(["bottom", "right", "u_outer", "v_outer"]),
				left_tile(["bottom", "right", "u_outer", "v_inner"]),
				left_tile(["top", "right", "u_outer", "v_inner"]),
				left_tile(["top", "right", "u_outer", "v_outer"])
			],
			{ face_type: "oct", u_boundary: true }
		);
		// 2 top/bottom strips
		this.add_face(
			["oct", "top", "center"],
			[
				["top", "left", "u_inner", "v_outer"],
				["top", "left", "u_inner", "v_inner"],
				["top", "right", "u_inner", "v_inner"],
				["top", "right", "u_inner", "v_outer"],
				top_tile(["bottom", "right", "u_inner", "v_outer"]),
				top_tile(["bottom", "right", "u_inner", "v_inner"]),
				top_tile(["bottom", "left", "u_inner", "v_inner"]),
				top_tile(["bottom", "left", "u_inner", "v_outer"])
			],
			{ face_type: "oct", v_boundary: true }
		);
	}
	color_pattern1() {
		this.color_face(["oct", "top", "center"], 1);
		this.color_face(["oct", "middle", "left"], 1);
		this.color_face(["oct", "top", "left"], 2);
		this.color_face(["oct", "middle", "center"], 2);
	}
}
class WeaveTessagon extends Tessagon {
	static tile_class = WeaveTile;
	static metadata = weave_metadata;
}


const zigzag_metadata = new TessagonMetadata({
	name: "Zig-Zag",
	num_color_patterns: 1,
	classification: "non_edge",
	shapes: ["rectangles"],
	sides: [4],
	uv_ratio: 1.0
});
class ZigZagTile extends Tile {
	init_verts() {
		return {
			1: { 1: null, 2: null, 3: null, 4: null, 5: null },
			2: { 1: null, 2: null, 3: null, 4: null, 5: null },
			3: { 1: null, 2: null, 3: null, 4: null, 5: null },
			4: { 1: null, 2: null, 3: null, 4: null, 5: null },
			5: { 1: null, 2: null, 3: null, 4: null, 5: null }
		};
	}
	init_faces() {
		return {
			1: null, 2: null, 3: null, 4: null, 5: null,
			6: null, 7: null, 8: null, 9: null, 10: null
		};
	}
	calculate_verts() {
		const c = {
			1: 0.0,
			2: 1 / 4.0,
			3: 2 / 4.0,
			4: 3 / 4.0,
			5: 1.0
		};
		for (const colKey in this.verts) {
			const col = parseInt(colKey);
			for (const rowKey in this.verts[col]) {
				const row = parseInt(rowKey);
				if (col === 5) {
					if (!this.get_neighbor_tile(["right"])) {
						if (!this.get_neighbor_tile(["top"])) {
							if (row === 5) continue;
							if (row === 4) continue;
						}
						if (!this.get_neighbor_tile(["bottom"])) {
							if (row === 1) continue;
						}
					}
				}
				const vert = this.add_vert([col, row], c[col], c[row]);
				if (col === 1) {
					this.set_equivalent_vert(...left_tile([5, row]), vert);
					if (row === 5) {
						this.set_equivalent_vert(...left_top_tile([5, 1]), vert);
					} else if (row === 1) {
						this.set_equivalent_vert(...left_bottom_tile([5, 5]), vert);
					}
				} else if (col === 5) {
					this.set_equivalent_vert(...right_tile([1, row]), vert);
					if (row === 5) {
						this.set_equivalent_vert(...right_top_tile([1, 1]), vert);
					} else if (row === 1) {
						this.set_equivalent_vert(...right_bottom_tile([1, 5]), vert);
					}
				}
				if (row === 5) {
					this.set_equivalent_vert(...top_tile([col, 1]), vert);
				} else if (row === 1) {
					this.set_equivalent_vert(...bottom_tile([col, 5]), vert);
				}
			}
		}
	}
	calculate_faces() {
		this.add_face(1, [[1, 5],
		[1, 4],
		[2, 4],
		[3, 4],
		[3, 5],
		[2, 5]]);
		this.add_face(2, [[3, 5],
		[3, 4],
		[3, 3],
		[4, 3],
		[4, 4],
		[4, 5]]);
		let face = this.add_face(3, [[4, 5],
		[4, 4],
		[5, 4],
		[5, 5],
		top_tile([5, 2]),
		top_tile([4, 2])]);
		this.set_equivalent_face(...top_tile(10), face);
		face = this.add_face(4, [[1, 3],
		[2, 3],
		[2, 4],
		[1, 4],
		left_tile([4, 4]),
		left_tile([4, 3])]);
		this.set_equivalent_face(...left_tile(6), face);
		this.add_face(5, [[3, 2],
		[3, 3],
		[3, 4],
		[2, 4],
		[2, 3],
		[2, 2]]);
		face = this.add_face(6, [[5, 4],
		[4, 4],
		[4, 3],
		[5, 3],
		right_tile([2, 3]),
		right_tile([2, 4])]);
		this.set_equivalent_face(...right_tile(4), face);
		this.add_face(7, [[2, 1],
		[2, 2],
		[2, 3],
		[1, 3],
		[1, 2],
		[1, 1]]);
		this.add_face(8, [[5, 2],
		[5, 3],
		[4, 3],
		[3, 3],
		[3, 2],
		[4, 2]]);
		this.add_face(9, [[4, 1],
		[4, 2],
		[3, 2],
		[2, 2],
		[2, 1],
		[3, 1]]);
		face = this.add_face(10, [[5, 1],
		[5, 2],
		[4, 2],
		[4, 1],
		bottom_tile([4, 4]),
		bottom_tile([5, 4])]);
		this.set_equivalent_face(...bottom_tile(3), face);
	}
	color_pattern1() {
		this.color_face(1, 1);
		this.color_face(2, 1);
		this.color_face(7, 1);
		this.color_face(8, 1);
	}
}
class ZigZagTessagon extends Tessagon {
	static tile_class = ZigZagTile;
	static metadata = zigzag_metadata;
}




























