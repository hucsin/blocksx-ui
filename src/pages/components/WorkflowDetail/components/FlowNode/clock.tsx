import React from 'react';
import './clock.scss';

export default class Clock extends React.Component {
    

    public render() {
        let d:any = new Date()
        const h=d.getHours();const m = d.getMinutes();const s = d.getSeconds();
        return (
            <div  className="ui-clock" style={{"--ds": s,"--dm": m + s/60,'--dh': h +m/60} as any}>
                <div className='clock-pane'>
                    {Array.from({length: 12}).map((it, index) => {
                        return (
                            <span key={index} style={{'--i': index+1} as any}>{index+1}</span>
                        )
                    })}
                </div>
                <div className='hour'></div>
                <div className='min'></div>
                <div className='sec'></div>
            </div>
        )
    }
}

