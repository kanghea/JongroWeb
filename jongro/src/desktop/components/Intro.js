import React from 'react';
import { Controller, Scene } from 'react-scrollmagic';

const Intro = () => (
  <div>
    <Controller>
      <Scene duration={600} pin>
        <div>Sticky Example</div>
      </Scene>
    </Controller>
  </div>
);

export default Intro;