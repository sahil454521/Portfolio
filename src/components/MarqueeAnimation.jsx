import Marquee from "react-fast-marquee";
import React from 'react'
import { IoLogoJavascript, IoLogoCss3 } from "react-icons/io5";
import { FaHtml5, FaReact, FaNodeJs, FaPython, FaRobot } from "react-icons/fa";
import { SiExpress } from "react-icons/si";
import { DiMongodb, DiMysql } from "react-icons/di";
import { BiLogoTailwindCss } from "react-icons/bi";
import { TbBrandRedux } from "react-icons/tb";
import { SiTypescript,SiTensorflow  } from "react-icons/si";

const skillsWithIcons1 = [
  { name: 'HTML', icon: <FaHtml5 className="ml-2" size={20} /> },
  { name: 'CSS', icon: <IoLogoCss3 className="ml-2" size={20} /> },
  { name: 'JavaScript', icon: <IoLogoJavascript className="ml-2" size={20} /> },
  { name: 'React', icon: <FaReact className="ml-2" size={20} /> },
  { name: 'Node.js', icon: <FaNodeJs className="ml-2" size={20} /> },
  { name: 'Express.js', icon: <SiExpress className="ml-2" size={20} /> },
  { name: 'TypeScript', icon: <SiTypescript className="ml-2" size={20} /> },
];
const skillsWithIcons2 = [
  { name: 'MongoDB', icon: <DiMongodb className="ml-2" size={20} /> },
  { name: 'Tailwind CSS', icon: <BiLogoTailwindCss className="ml-2" size={20} /> },
  { name: 'Python', icon: <FaPython className="ml-2" size={20} /> },
  { name: 'Redux', icon: <TbBrandRedux className="ml-2" size={20} /> },
  { name: 'AI/ML', icon: <FaRobot className="ml-2" size={20} /> },
  { name: 'SQL', icon: <DiMysql className="ml-2" size={20} /> },
  { name: 'Tensorflow', icon: <SiTensorflow  className="ml-2" size={20} /> }
];

const MarqueeAnimation = () => {
  return (
    <div className="bg-[#111111] py-8">
      <h4 className='text-white text-2xl font-bold text-center mb-6'>Currently Working With</h4>
      <div className="max-w-2xl mx-auto rounded-lg border border-[#111111] bg-opacity-0 backdrop-blur-sm p-6">
        <div className="flex flex-col gap-4">
          <Marquee className="py-2" direction="left" speed={50} pauseOnHover={true}>
            {skillsWithIcons1.map((skill, index) => (
              <div key={`left-${index}`} className='flex items-center text-white text-lg font-semibold mx-4'>
                {skill.name}{skill.icon}
              </div>
            ))}
          </Marquee>
          <Marquee className="py-2" direction="right" speed={50} pauseOnHover={true}>
            {skillsWithIcons2.map((skill, index) => (
              <div key={`right-${index}`} className='flex items-center text-white text-lg font-semibold mx-4'>
                {skill.name}{skill.icon}
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default MarqueeAnimation;

