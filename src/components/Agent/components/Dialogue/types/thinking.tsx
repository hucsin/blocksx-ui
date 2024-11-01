import React from 'react';

export default class Thinking extends React.Component<{type?: string}, {message: string, list: any[]}> {
    private dialogue: any = {
        default: [
            {
                message: 'Analyzing intent',
                keep: 3000
            },
            {
                message: 'Thinking',
                keep: 3000
            },
            {
                message: 'Generating response',
                keep: 3000
            }
        ],
        submit: [
            {
                message: 'Parsing input',
                keep: 3000
            },
            {
                message: 'Creating Action',
                keep: 3000
            },
            {
                message: 'Generating response',
                keep: 4000
            }

        ]

    } 
    public constructor(props: any) {
        super(props);
        this.state = {
            message: '',
            list: [
                {
                    message: 'Thinking',
                    keep: 3000
                },
                {
                    message: ''
                }
            ]
        }
    }
    public componentDidMount() {
        let dialogue: any = this.dialogue[this.props.type || 'default']

        this.say(dialogue)
    }
    public say(queue: any[]) {
        let current: any = queue.shift()

        if (current) {
            this.setState({message: current.message})
            if (current.keep) {
            setTimeout(() => {
                this.say(queue)
                }, current.keep)
            }
        }
    }
    public render() {
        return <div className='thinking'>{this.state.message}</div>
    }
}