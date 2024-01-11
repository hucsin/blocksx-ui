import React, { PureComponent } from 'react';
import ReactCrop from 'react-image-crop';
import classnames from 'classnames';
import './style.scss';

import { IFormerBase } from '../../typings';

import { Popover, Button } from 'antd';
import { UploadImage, CloseOutlined } from '../../../Icons'

interface IconProp extends IFormerBase {
  // 限制比例，宽/高
  aspect?: number;
  onChangeValue: Function
}
interface IconState {
  visible: boolean;
  value?: string;
  src?: any;
  crop?: any;
  gray: boolean;
  croppedImageUrl?: any;
}


export default class Icon extends PureComponent<IconProp, IconState> {
  private imageRef: any;
  private fileUrl: any;
  private inputDom: any;
  public constructor(props: IconProp) {
    super(props);
    
    let _props: any = props['x-type-props'] || {};

    this.state = {
      visible: false,
      value: props.value,
      gray: _props.gray || ( _props.gray === false ? false : true),
      crop: {

        x: 10,
        y: 10,
        unit: 'px',
        aspect: props.aspect || 1,
        width: 50,
        height: 50
      }
    }
  }

  public onSelectFile = (e:any) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader:any = new FileReader();
      reader.addEventListener('load', () =>{
        
        this.setState({ visible: true,src: reader.result })
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // If you setState the crop in here you should return false.
  public onImageLoaded = (image:any) => {
    this.imageRef = image;
    
  };

  public onCropComplete = (crop:any) => {
    this.makeClientCrop(crop);
  };

  public onCropChange = (crop: any, percentCrop: any) => {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    this.setState({ crop });
  };
  private onEmpty =()=> {
    this.doSave('')
  }

  public async makeClientCrop(crop:any) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl: any = await this.getCroppedImg(
        this.imageRef,
        crop,
        'newFile.jpeg'
      );
      this.setState({ croppedImageUrl });
    }
  }
  private grayCanvas(ctx: any, canvas: any) {
    let imgdata:any = ctx.getImageData(0,0,canvas.width,canvas.height);
    let data:any = imgdata.data;

    for(let i=0, n=data.length; i<n; i+=4) {
      let average=(data[i]+data[i+1]+data[i+2])/3;
      data[i]=average;
      data[i+1]=average;
      data[i+2]=average;
    }

    ctx.putImageData(imgdata,0,0);
  }
  public getCroppedImg(image:any, crop: any, fileName: string) {
    const canvas:any = document.createElement('canvas');
    const pixelRatio: any = window.devicePixelRatio;
    const scaleX:number = image.naturalWidth / image.width;
    const scaleY:number = image.naturalHeight / image.height;
    const ctx:any = canvas.getContext('2d');

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
    // 灰度化
    if (this.state.gray) {
      this.grayCanvas(ctx, canvas)
    }

    return new Promise((resolve, reject) => {
      resolve(canvas.toDataURL("image/png"))
    });
  }
  private reset() {
    if (this.inputDom) {
      this.inputDom.value = '';
    }
  }
  private isValidValue(v) {
    return v || v == '';
  }
  private onSave = ()=> {
    this.doSave(this.state.croppedImageUrl)
  }
  private doSave(value: any) {
    this.setState({
      value: value,
      visible: false
    });

    this.reset();
    this.props.onChangeValue(value);
  }
  private renderCrop() {
    return (
      <React.Fragment>
        <p style={{
          color: '#ccc',
          fontSize: 12
        }}>请先剪切图片再保存</p>
        <ReactCrop
          // @ts-ignore
            src={this.state.src as any}
            crop={this.state.crop}
            ruleOfThirds
            keepSelection
            onImageLoaded={this.onImageLoaded}
            onComplete={this.onCropComplete}
            onChange={this.onCropChange}
          />
        <div
          style={{
            textAlign: 'right',
            marginTop: '8px'
          }}
        >
          <Button size="small" onClick={()=>{
            this.setState({
              visible: false
            })
            this.reset()
          }} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button size="small" onClick={this.onSave} type="primary">
           剪切 & 保存
          </Button>
        </div>
      </React.Fragment>
    )
  }

  public render() {

    return (
      <div className="App">
        
        <Popover
          content={this.renderCrop()}
          placement="bottomLeft"
          visible={this.state.visible}
          autoAdjustOverflow={false}

          overlayStyle={{
            maxWidth: 250
          }}
        >
          <div className={classnames({
            'former-icon-wrapper': true,
            'former-icon-disabled': this.state.visible,
            'former-icon-hasvalue': this.state.value
          })}>
            {this.state.value ? <div className={classnames({
              'former-icon-close': true
            })}>
              <CloseOutlined onClick={this.onEmpty}/>
            </div>: null}
            <div className='former-icon-inner'>
              {this.state.value ? <img src={this.state.value}/> : null}
              <UploadImage/>
              {!this.state.visible ? <input ref={(ref:any)=>{ this.inputDom = ref}} type="file" accept="image/*" onChange={this.onSelectFile} /> : null}
            </div>
          </div>
        </Popover>
      </div>
    );
  }
}