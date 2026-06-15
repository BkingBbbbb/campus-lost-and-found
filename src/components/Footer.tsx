import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">关于平台</h3>
            <p className="mt-2 text-sm text-gray-500">
              校园失物招领平台旨在帮助郑州工商学院师生更方便地发布和查找失物信息，构建和谐校园。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">快速链接</h3>
            <ul className="mt-2 space-y-1">
              <li><Link href="/lost" className="text-sm text-gray-500 hover:text-gray-700">寻物启事</Link></li>
              <li><Link href="/found" className="text-sm text-gray-500 hover:text-gray-700">失物招领</Link></li>
              <li><Link href="/post" className="text-sm text-gray-500 hover:text-gray-700">发布信息</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">联系我们</h3>
            <ul className="mt-2 space-y-1">
              <li className="text-sm text-gray-500">郑州工商学院</li>
              <li className="text-sm text-gray-500">教务处</li>
              <li className="text-sm text-gray-500">《低代码开发技术》课程项目</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-4 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} 校园失物招领平台 - 郑州工商学院《低代码开发技术》课程作品
          </p>
        </div>
      </div>
    </footer>
  );
}
