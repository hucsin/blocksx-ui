import React from 'react';
import classnames from 'classnames';

export default class Image extends React.Component<{url:string}, {error: boolean, success: boolean}> {
    public constructor(props:any) {
        super(props);
        this.state = {
            error: false,
            success: false
        }
    }
    public render() {
        return (
            <div className={classnames({
                'image-wraper': true,
                'image-success': this.state.success
            })}>
                { this.state.error ?
                    <div className='ui-empty'>The current image has expired. You can generate a new one.</div> : 
                    <div className='ui-image'><img src={this.props.url} onLoad={()=> {
                        this.setState({
                            success: true
                        })
                    }} onError={()=> {this.setState({error:true})}}/><p>The image is valid for 60 minutes. Please <a href={this.props.url} target='_blank'>download</a> and save it if needed.</p></div>
                }
            </div>
        )
    }
}