class FIREWORKS {
  constructor({full_screen=false, target_node, amount=5}) {
    this._set_inner_classes();

    this.make_full = full_screen;
    this.target_node = full_screen ? document.body : target_node;
    [this.W, this.H] = 
      [full_screen ? window.innerWidth : target_node.clientWidth, 
       full_screen ? window.innerHeight : target_node.clientHeight];

    this.GOLDEN_SPIRAL = Math.PI * (1 + Math.sqrt(5));
    this.PI_HALF = Math.PI/2;

    this.FIREWORKS_NUM = amount;
    this.SPARKS_NUM_PER_FIREWORK = 150;
    this.SPARKS_RADIUS = (this.W > this.H ? this.H : this.W) / 250;

    this.GRAVITY_RATIO_TO_HEIGHT = 1 / 20;
    this.GRAVITY = -this.H * this.GRAVITY_RATIO_TO_HEIGHT;
    
    this.COFFICIENT_OF_AIR_RESISTANCE = 2;
    
    this.VELOCITY_RATIO_TO_WH = 2 / 3;
    this.VELOCITY = (this.W > this.H ? this.H : this.W) * this.VELOCITY_RATIO_TO_WH;
    this.LAUNCH_VELOCITY = this.H * this.VELOCITY_RATIO_TO_WH;

    this.STEP_INTERVAL = 1 / 60;
    this.SPARK_TIME = 2500;
    this.SLEEP_TIME = 5000;

    this.BACKGROUND = "rgb(0, 0, 0)";
    this.RESIDUAL = "rgba(0, 0, 0, 0.1)";

    this.ctx = document.createElement("canvas").getContext("2d");
    [this.ctx.canvas.width, this.ctx.canvas.height] 
     = [this.W, this.H];
    this.clear();

    if (full_screen) {
      FIREWORKS.set_full_screen();
    } else {
      this.ctx.canvas.style.margin = 0;
      this.ctx.canvas.style.padding = 0;
    }
    this.target_node.appendChild(this.ctx.canvas);
    
    this.pixi = new PIXI.Application({
      resolution: 1,
      antialias: true,
      autoDensity: true,
      transparent: true
    });

    this.pixi.renderer.resize(this.W, this.H);

    this.container = new PIXI.ParticleContainer(
      this.FIREWORKS_NUM * (this.SPARKS_NUM_PER_FIREWORK * 4 + 1),
      { tint: true }
    );

    this.pixi.stage.addChild(this.container);

    this.sparks = this.pixi.renderer.generateTexture(
      new PIXI.Graphics()
      .beginFill(0xffffff, 1)
      .drawCircle(0, 0, 500)
      .endFill()
    );

    this.fireworks = [...Array(this.FIREWORKS_NUM)]
      .map(() => new this.Firework());
    
    const TRIGGER = "ontouchend" in document ? "orientationchange" : "resize";
    this.timeout;
    window.addEventListener(TRIGGER, () => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.resize.bind(this), 250);
    });
  }

  start_burst() {
    this.pixi.ticker.add(this.render.bind(this));
  }
  
  stop() {
    this.pixi.ticker.stop();
  }
  
  restart() {
    this.pixi.ticker.start();
  }
  
  clear() {
    this.ctx.fillStyle = this.BACKGROUND;
    this.ctx.fillRect(0, 0, this.W, this.H);
    this.ctx.fillStyle = this.RESIDUAL;
  }

  render() {
    this.ctx.fillRect(0, 0, this.W, this.H);

    for (let i = 0; i < this.FIREWORKS_NUM; i++)
      this.fireworks[i].update();
    
    this.ctx.drawImage(this.pixi.view, 0, 0);
  }

  resize() {
    requestAnimationFrame(() => {
      [this.W, this.H] =
        [this.ctx.canvas.width, this.ctx.canvas.height] =
        [this.make_full ? window.innerWidth : this.target_node.clientWidth, 
         this.make_full ? window.innerHeight : this.target_node.clientHeight];
      
      this.pixi.renderer.resize(this.W, this.H);

      this.GRAVITY = -this.H * this.GRAVITY_RATIO_TO_HEIGHT;
      this.VELOCITY = (this.W > this.H ? this.H : this.W) * this.VELOCITY_RATIO_TO_WH;
      this.LAUNCH_VELOCITY = this.H * this.VELOCITY_RATIO_TO_WH;

      this.clear();
    });
  }

  _set_inner_classes() {
    const parent = this;

    this.Coordinates = class {
      constructor(x=0, y=0, z=0) {
        [this.x, this.y, this.z] = [x, y, z];
      }

      copy({x, y, z}) {
        [this.x, this.y, this.z] = [x, y, z];
      }
    };

    this.Vector3D =  class extends this.Coordinates {
      constructor({x, y, z, theta, phi, radius}={}) {
        super(x, y, z);

        if (x!=undefined && y!=undefined && z!=undefined) return;
        this.deconposition(theta, phi, radius);
      }

      deconposition(theta=Math.PI/2, phi=Math.PI/4, radius=Math.sqrt(2)) {
        this.x = radius * Math.sin(theta) * Math.cos(phi);
        this.y = radius * Math.sin(theta) * Math.sin(phi);
        this.z = radius * Math.cos(theta);
      }
    };

    this.MotionCalculator = class {
      constructor(init_vector, reference_coordinates) {
        this._parent = parent;

        this.init_vector = new parent.Vector3D();
        this.reference_coordinates = new parent.Coordinates();
        this.current_position = new parent.Coordinates();
        
        this.time_elapsed;

        if (!init_vector || !reference_coordinates) return;
        this.init(init_vector, reference_coordinates);
      }

      step() {
        this.current_position.x =
          this.reference_coordinates.x +
          this.init_vector.x / this._parent.COFFICIENT_OF_AIR_RESISTANCE *
          (1 - Math.pow(Math.E, -this._parent.COFFICIENT_OF_AIR_RESISTANCE * this.time_elapsed));

        this.current_position.y =
          this.reference_coordinates.y +
          (-this._parent.GRAVITY * this.time_elapsed) / this._parent.COFFICIENT_OF_AIR_RESISTANCE +
          Math.pow(this._parent.COFFICIENT_OF_AIR_RESISTANCE, -2) *
          (this._parent.GRAVITY + this._parent.COFFICIENT_OF_AIR_RESISTANCE * this.init_vector.y) *
          (1 - Math.pow(Math.E, -this._parent.COFFICIENT_OF_AIR_RESISTANCE * this.time_elapsed));

        this.current_position.z =
          this.reference_coordinates.z +
          this.init_vector.z / this._parent.COFFICIENT_OF_AIR_RESISTANCE *
          (1 - Math.pow(Math.E, -this._parent.COFFICIENT_OF_AIR_RESISTANCE * this.time_elapsed));

        this.time_elapsed += this._parent.STEP_INTERVAL;
      }

      init(init_vector, reference_coordinates) {
        this.init_vector.copy(init_vector);
        this.reference_coordinates.copy(reference_coordinates);
        this.current_position.copy(reference_coordinates);
        this.time_elapsed = 0;
      }
    };

    this.FireParticle = class extends PIXI.Sprite {
      constructor(scale) {
        super(parent.sparks);
        this._parent = parent;
        
        this.anchor.set(0.5);

        this.highlight = new PIXI.Sprite(parent.sparks);
        this.highlight.anchor.set(0.5);
        this.highlight.tint = 0xffffff;

        this.life = parent.SPARK_TIME * (FIREWORKS.rand_range(93, 101)/100);
        this.appear_time;
        this.is_appear;

        this.set_scale(scale);

        this.motion_calculator = new parent.MotionCalculator();

        parent.container.addChild(this);
        parent.container.addChild(this.highlight);
      }

      step() {
        if (performance.now() - this.appear_time > this.life && this.is_appear)
          this.disappear();

        this.motion_calculator.step();

        this.set_position(
          this.motion_calculator.current_position
        );
      }

      init_orbit(init_vector, reference_coordinates) {
        this.motion_calculator.init(
          init_vector,
          reference_coordinates
        );

        this.set_position(
          reference_coordinates
        );
      }

      set_scale(scale) {
        const rate = this._parent.SPARKS_RADIUS * scale * 2 / this.texture.width;
        this.scale.set(rate);
        this.highlight.scale.set(rate * 0.6);
      }

      set_position(position) {
        this.position.set(
          position.x, position.y
        );

        this.highlight.position.set(
          position.x, position.y
        );
      }

      disappear() {
        this.alpha = 0;
        this.highlight.alpha = 0;
        this.is_appear = false;
      }

      appear() {
        this.alpha = 1;
        this.highlight.alpha = 1;
        this.is_appear = true;
        this.appear_time = performance.now();
      }
    }

    this.FireLauncher = class extends this.FireParticle {
      constructor() {
        super(1);
        this._parent = parent;

        this.life = 100000;

        this.start_point = new parent.Coordinates();

        this.init();
      }

      init() {
        this.start_point.y = this._parent.H;
        this.start_point.x = FIREWORKS.rand_range(
          this._parent.W * 0.1,
          this._parent.W * 0.9
        );

        this.init_orbit(
          new this._parent.Vector3D({
            theta: this._parent.PI_HALF,
            phi: -this._parent.PI_HALF,
            radius: FIREWORKS.rand_range(
              this._parent.LAUNCH_VELOCITY, 
              this._parent.LAUNCH_VELOCITY * 2.5
            )
          }),
          this.start_point
        );
      }
    };

    this.Stars = class {
      constructor(is_sub_star) {
        this._parent = parent;

        this.center = new parent.Coordinates();

        this.velocity_random_rate = FIREWORKS.rand_range(70, 111)/100;

        this.reduction_rate = is_sub_star ? 0.7 : 1;

        this.stars = [...Array(parent.SPARKS_NUM_PER_FIREWORK)]
          .map(() => new parent.FireParticle(this.reduction_rate));
      }

      init(center) {
        this.velocity_random_rate = FIREWORKS.rand_range(70, 111)/100;
        this.center.copy(center);
        this.place_stars_in_hemisphere();
      }

      burst() {
        for (let i = 0, len = this.stars.length; i < len; i++)
          this.stars[i].step();
      }

      place_stars_in_hemisphere() {
        const color = FIREWORKS.rand_range(0, 16777215);
        const random_level = 400;
        let stars_index = 0, index = Math.random(), random_add;
        let current, theta, phi;
        while(stars_index < this._parent.SPARKS_NUM_PER_FIREWORK) {
          theta = Math.acos(1 - index / this._parent.SPARKS_NUM_PER_FIREWORK);
          random_add = FIREWORKS.rand_range(random_level - 1, random_level + 2)/random_level;

          if (theta > this._parent.PI_HALF) {
            index += random_add;
            continue;
          }

          phi = this._parent.GOLDEN_SPIRAL * index;

          current = this.stars[stars_index];
          current.init_orbit(
            new this._parent.Vector3D({
              theta: theta,
              phi: phi,
              radius: this._parent.VELOCITY * this.velocity_random_rate * this.reduction_rate
            }),
            this.center
          );

          current.tint = color;

          index += random_add;
          stars_index++;
        }
      }

      appear() {
        for (let i = 0, len = this.stars.length; i < len; i++)
          this.stars[i].appear();
      }

      disappear() {
        for (let i = 0, len = this.stars.length; i < len; i++)
          this.stars[i].disappear();
      }
    };

    this.Firework = class {
      constructor() {
        this._parent = parent;
  
        this.launcher = new parent.FireLauncher();
  
        this.stars = new parent.Stars(false);
        this.stars.disappear();
  
        this.sub_stars = new parent.Stars(true);
        this.sub_stars.disappear();
  
        this.last_launcher_position;
        this.burst_start_time;
  
        this.sleep_start_time;
        this.sleep_time;
  
        this.update = this.launch;
  
        this.make_sublayer_burst = false;
      }

      launch() {
        if (this.last_launcher_position < this.launcher.y) {
          this.switch_launch2burst();
          return;
        }

        this.last_launcher_position = this.launcher.y;
        this.launcher.step();
      }

      burst() {
        if (performance.now() - this.burst_start_time > this._parent.SPARK_TIME) {
          this.switch_burst2sleep();
          return;
        }

        this.stars.burst();
        this.sub_stars.burst();
      }

      sleep() {
        if (performance.now() - this.sleep_start_time > this.sleep_time)
          this.switch_sleep2launch();
      }

      switch_launch2burst() {
        this.launcher.disappear();
        this.make_sublayer_burst = FIREWORKS.rand_range(0, 2);

        this.stars.init(this.launcher);
        this.stars.appear();

        this.sub_stars.init(this.launcher);
        if (this.make_sublayer_burst)
          this.sub_stars.appear();
        
        this.burst_start_time = performance.now();
        this.update = this.burst;
      }

      switch_burst2sleep() {
        this.stars.disappear();
        this.sub_stars.disappear();
        this.sleep_time = FIREWORKS.rand_range(0, this._parent.SLEEP_TIME);
        this.sleep_start_time = performance.now();
        this.update = this.sleep;
      }

      switch_sleep2launch() {
        this.last_launcher_position = this._parent.H;
        this.launcher.init();
        this.launcher.appear();
        this.update = this.launch;
      }
    };
  }

  static rand_range(min, max) {
    return Math.floor(Math.random() * Math.floor(max - min)) + min;
  }
  
  static set_full_screen() {
    const style = document.createElement('style');
    const rule = document.createTextNode(`
    * {
      margin: 0;
      padding: 0;
    }
    html {
      height: 100%;
    }
    body {
      width: 100%;
      height:100%;
    }
    canvas {
      position:absolute;
      top:0;
      left:0;
    }
    `);
    style.media = 'screen';
    style.type = 'text/css';
    style.appendChild(rule);
    document.getElementsByTagName('head').item(0).appendChild(style);
  }
}


