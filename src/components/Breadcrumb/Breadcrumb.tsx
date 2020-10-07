import React from 'react';
import { Link } from 'react-router-dom';
import './style.scss';

interface Step {
	name: string;
	link?: string;
}

interface Props {
	items: Step[];
}

export const Breadcrumb = ({ items }: Props) => {
	return (
		<div className="Breadcrumb">
			{items.map(({ name, link }, index) => (
				<div className="item" key={`${name}-${index}`}>
					{index === items.length - 1 ? (
						<span className="last">{name}</span>
					) : (
						<div className="link-icon-container">
							<Link to={link}>{name}</Link>
							<img
								src={require('../../assets/images/icon-breadcrumb-divider.svg')}
								className="divider"
								alt="breadcrumb divider"
							/>
						</div>
					)}
				</div>
			))}
		</div>
	);
};
